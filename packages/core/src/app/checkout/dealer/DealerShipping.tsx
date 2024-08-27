// @ts-nocheck
import { Address, AddressRequestBody, Cart, CheckoutRequestBody, CheckoutStoreSelector, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, ConsignmentUpdateRequestBody, Country, Customer, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions, RequestOptions } from '@bigcommerce/checkout-sdk';
import React, { lazy } from 'react';
import { debounce, noop } from 'lodash';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import getShippingMethodId from '../../shipping/getShippingMethodId';
import getShippableItemsCount from '../../shipping/getShippableItemsCount';
import hasUnassignedLineItems from '../../shipping/hasUnassignedLineItems';
import hasSelectedShippingOptions from '../../shipping/hasSelectedShippingOptions';
import updateShippableItems from '../../shipping/updateShippableItems';
import AddressSelect from '../../address/AddressSelect';
import { AddressType, StaticAddress } from '../../address';
import { TranslatedString } from '../../locale';
import { AssignItemFailedError, AssignItemInvalidAddressError, UnassignItemError } from '../../shipping/errors';
import { isValidAddress, mapAddressFromFormValues, AddressFormModal, AddressFormValues } from '../../address';
import { retry, EMPTY_ARRAY } from '../../common/utility';
import { Form } from '../../ui/form';

import getShippableLineItems from './getShippableLineItems';

import './DealerShipping.scss';

const Shipping = lazy(() => retry(() => import(
    /* webpackChunkName: "shipping" */
    '../../shipping/Shipping'
)));

const ItemFFL = lazy(() => retry(() => import(
    /* webpackChunkName: "shipping" */
    './ItemFFL'
)));

const ShippingFormFooter = lazy(() => retry(() => import(
    /* webpackChunkName: "shippingFormFooter" */
    './ShippingFormFooter'
)));

const Locator = lazy(() => retry(() => import(
    /* webpackChunkName: "locator" */
    './Locator'
)));

const StatesDropdown = lazy(() => retry(() => import(
    /* webpackChunkName: "statesDropdown" */
    './StatesDropdown'
)));

const CustomShippingForm = lazy(() => retry(() => import(
    /* webpackChunkName: "customShippingForm" */
    './CustomShippingForm'
)));

export interface MultiShippingFormValues {
    orderComment: string;
}

export interface WithCheckoutShippingProps {
    billingAddress?: Address;
    cart: Cart;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isGuest: boolean;
    isInitializing: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowAddAddressInCheckout: boolean;
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitializeShippingMethod(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignment(consignmentId: string, options?: RequestOptions): Promise<CheckoutSelectors>;
    updateConsignment(consignment: ConsignmentUpdateRequestBody, options?: RequestOptions): Promise<CheckoutSelectors>;
    getFields(countryCode?: string): FormField[];
    initializeShippingMethod(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    signOut(options?: CustomerRequestOptions): void;
    unassignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    updateBillingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
    updateShippingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

interface DealerProps {
  cartHasChanged: any;
  isMultiShippingMode: any;
  navigateNextStep: any;
  onCreateAccount: any;
  fflConsignmentItems: any;
  ammoConsignmentItems: any;
  onReady: any;
  onSignIn: any;
  onToggleMultiShipping: any;
  onUnhandledError: any;
  isValid?: any;
  addresses: any;
  defaultCountryCode: string;
  customerMessage: string;
  storeHash: string;
}

interface DealerState {
  selectedDealer: any;
  showLocator: any;
  manualFflInput: any;
  isUpdatingShippingData: boolean;
  isLoading: boolean;
  items: any;
  itemAddingAddress: any;
  createCustomerAddressError: any;
  isInitializing?: boolean;
  announcement: any;
  multiShipment: any;
  ammoFFLRequiredStates: any;
  ammoStateFFLRequired: boolean;
  ammoSelectedState: string;
  customShippingFirstName: string;
  customShippingFirstNameError: boolean;
  customShippingLastName: string;
  customShippingLastNameError: boolean;
  customShippingCompany: string;
  customShippingPhone: string;
  customShippingAddress: string;
  customShippingAddressError: boolean;
  customShippingApartment: string;
  customShippingCity: string;
  customShippingCityError: boolean;
  customShippingPostal: string;
  customShippingPostalError: boolean;
  withAmmoSubscription: boolean;
}

class DealerShipping extends React.PureComponent<DealerProps & WithCheckoutShippingProps, DealerState> {

  static getDerivedStateFromProps(
      { cart, consignments, fflConsignmentItems, ammoConsignmentItems }: DealerProps & WithCheckoutShippingProps,
      state: DealerState
  ) {
      if (!state || !state.items || getShippableItemsCount(cart) !== state.items.length) {
          return {
            ...state,
            items: getShippableLineItems(cart, consignments)
          };
      }

      return null;
  }

  private debouncedAssignAddress: any;

  constructor(props: any) {
    super(props);

    this.state = {
        ammoFFLRequiredStates: [],
        ammoSelectedState: "",
        ammoStateFFLRequired: null,
        announcement: "",
        createCustomerAddressError: null,
        customShippingAddress: "",
        customShippingAddressError: false,
        customShippingApartment: "",
        customShippingCity: "",
        customShippingCityError: false,
        customShippingCompany: "",
        customShippingFirstName: "",
        customShippingFirstNameError: false,
        customShippingLastName: "",
        customShippingLastNameError: false,
        customShippingPhone: "",
        customShippingPostal: "",
        customShippingPostalError: false,
        isLoading: true,
        isUpdatingShippingData: false,
        itemAddingAddress: null,
        items: [],
        manualFflInput: false,
        multiShipment: false,
        selectedDealer: null,
        showLocator: false,
        withAmmoSubscription: false
    };

    this.debouncedAssignCustomShippingAddress = debounce(
        async () => {
            const { assignItem } = this.props;
            const address = {
                firstName: this.state.customShippingFirstName,
                lastName: this.state.customShippingLastName,
                phone: this.state.customShippingPhone,
                company: this.state.customShippingCompany,
                address1: this.state.customShippingAddress,
                address2: this.state.customShippingApartment,
                city: this.state.customShippingCity,
                stateOrProvinceCode: this.state.ammoSelectedState,
                shouldSaveAddress: false,
                postalCode: this.state.customShippingPostal,
                localizedCountry: "United States",
                countryCode: "US"
            };
            const lineItems = this.props.cart.lineItems.physicalItems.map(item => {
                let container = {};
                container.itemId = item.id;
                container.quantity = item.quantity;
                return container;
            });
            await assignItem({
                address,
                lineItems: lineItems
            });
        },
        500
    );

    fetch(`https://${process.env.HOST}/store-front/api/stores/${this.props.storeHash}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        const merchantStates = data.merchant.merchant_states.filter(
            merchantState => merchantState.enabled
        );

        this.props.setFFLtoOrderComments(data.ffl_to_order_comments);
        this.props.setWithAmmoSubscription(data.with_ammo_subscription);
        this.setState({
            announcement: data.announcement,
            multiShipment: data.multi_shipment,
            isLoading: false,
            ammoFFLRequiredStates: merchantStates.map(ms => ms.state.code),
            withAmmoSubscription: data.with_ammo_subscription
        });
    }).catch(console.log);
  }

  async componentDidMount(): Promise<void> {
      const {
          onReady = noop,
          onUnhandledError,
      } = this.props;

      try {
          onReady();
      } catch (error) {
          onUnhandledError(error);
      } finally {
          this.setState({ isInitializing: false });
      }
  }

  handleManualFFLInput: () => void = () => {
    const { manualFflInput } = this.state;

    this.setState({
      manualFflInput: !manualFflInput,
      selectedDealer: null
     });
  };

  toggleMapSelector: () => void = () => {
    this.setState({
      manualFflInput: false,
      showLocator: true
    });
  };

  selectDealer: (dealer: any) => void = async (dealer: any) => {
    this.setState({
      selectedDealer: dealer,
      showLocator: false
    });

    const { assignItem, getFields, onUnhandledError } = this.props;

    const allCartItems = this.state.items.map(item => {
        let container = {};
        container.itemId = item.id;
        container.quantity = item.quantity;
        return container;
    })

    const consignment = {
      lineItems: this.state.multiShipment ? allCartItems : this.props.fflConsignmentItems.concat(this.props.ammoConsignmentItems),
      shippingAddress: dealer
    }

    if (!isValidAddress(dealer, getFields(dealer.countryCode))) {
        return onUnhandledError(new AssignItemInvalidAddressError());
    }

    try {
        this.props.setSelectedFFL(dealer.fflID);
        await assignItem(consignment);

    } catch (e) {
        onUnhandledError(new AssignItemFailedError(e as any));
    }

  }

  handleCancel: () => void = () => {
    this.setState({
      showLocator: false,
    });
  }

    onChangeCustomShippingField: () => void = (value, stateKey) => {
        const { assignItem } = this.props;
        const stateKeyError = `${stateKey}Error`;

        this.setState({ 
            [stateKey]: value,
            [stateKeyError]: false
        });

        if (this.state.customShippingFirstName != "" &&
            this.state.customShippingLastName != "" &&
            this.state.customShippingAddress != "" &&
            this.state.customShippingCity != "" &&
            this.state.customShippingPostal != ""
        ){
            this.debouncedAssignCustomShippingAddress();
        }
    }

    validateSelectedState: (event: any) => void = () => {
        const { deleteConsignment, onUnhandledError } = this.props;
        const fflRequired = this.state.ammoFFLRequiredStates.includes(event.target.value)

        // deletes consignments, this will unassign previously selected addresses for each line item
        if (this.props.consignments.length > 0) {
            let lineItems = this.props.consignments.map(item => {
                let container = {};
                container.shippingAddress = item.address;
                container.itemId = item.id;
                return container;
            })
            lineItems.forEach((item) => {
                try {
                    deleteConsignment(item.itemId);
                } catch (e) {
                    onUnhandledError(new UnassignItemError(e as any));
                }
            })
        }

        if (event.target.value == "") {
            this.setState({ ammoStateFFLRequired: null, ammoSelectedState: event.target.value })
        } else {
            this.setState({ ammoStateFFLRequired: fflRequired, ammoSelectedState: event.target.value })
        }
    };

  private shouldDisableSubmit: () => boolean = () => {
      const {
          isLoading,
          consignments,
          isValid,
      } = this.props;

      const {
          isUpdatingShippingData,
      } = this.state;

      if (!isValid) {
          return false;
      }

      return isLoading || isUpdatingShippingData || !hasSelectedShippingOptions(consignments);
  };

  render() {
    const {
      ammoConsignmentItems,
      cart,
      cartHasChanged,
      consignments,
      countries,
      countriesWithAutocomplete,
      customer,
      customerMessage,
      defaultCountryCode,
      getFields,
      googleMapsApiKey,
      fflConsignmentItems,
      isLoading,
      shouldShowOrderComments
    } = this.props;

    const items = getShippableLineItems(cart, consignments);
    const fflItems = fflConsignmentItems.concat(ammoConsignmentItems)

    const itemsWithoutFFL = items.filter(
        item => !fflItems.some((fflItem: any) => item.id === fflItem.itemId)
    );

    const groupedItemsWithoutFFL = _.groupBy(itemsWithoutFFL, item => item.productId);

    const groupedItemsWithoutFFLEntries = Object.entries(groupedItemsWithoutFFL);

    const itemsWithFFL = items.filter(
        item => fflItems.some((fflItem: any) => item.id === fflItem.itemId)
    );

    const groupeditemsWithFFL = _.groupBy(itemsWithFFL, item => item.productId);

    const groupedItemsWithFFLEntries = Object.entries(groupeditemsWithFFL);

    const fflConsignment = consignments.filter(
        item => fflItems.some((fflItem: any) => item.lineItemIds.includes(fflItem.itemId))
    )[0];

    const { itemAddingAddress } = this.state;

    return (
      <section className="ffl-section checkout-form">
        { ((fflConsignmentItems.length == 0 && ammoConsignmentItems.length > 0) && (this.state.withAmmoSubscription)) &&
            <StatesDropdown validateSelectedState={ this.validateSelectedState } />
        }

        { (this.state.ammoStateFFLRequired || fflConsignmentItems.length > 0) && 
        <div>
            { ((this.state.manualFflInput === false) && (this.state.selectedDealer == null || !fflConsignment)) &&
            <div className="alertBox alertBox--error alertBox--font-color-black">
                <div className="alertBox-column alertBox-icon">
                <div className="icon">
                </div>
                </div>
                { groupedItemsWithFFLEntries.map(([key, items]) => (
                    <li key={ items[0].key }>
                        <ItemFFL
                            item={ items[0] }
                            quantity={ items.length }
                        />
                    </li>
                )) }
                <div className="alertBox-column alertBox-message">
                <p>You have purchased an item that must be shipped to a Federal Firearms License holder (FFL).</p>
                <p>Before making a selection, contact the FFL and verify that they can accept your shipment prior to completing your purchase.</p>
                </div>
            </div>
            }

            { ((this.state.selectedDealer != null) && (fflConsignment) ) &&
                <div className="consignment-product-body alertBox--success shipping">
                    { groupedItemsWithFFLEntries.map(([key, items]) => (
                        <li key={ items[0].key }>
                            <ItemFFL
                                item={ items[0] }
                                quantity={ items.length }
                            />
                        </li>
                    )) }
                    <StaticAddress
                        address={ fflConsignment.shippingAddress }
                        type={ AddressType.Shipping }
                    />
                </div>
            }

            <div className="form-action">
                <button type="button"
                    className="button button--primary optimizedCheckout-buttonPrimary"
                    onClick={ this.toggleMapSelector } >
                    { ((this.state.selectedDealer != null) && (fflConsignment) ) &&
                    <TranslatedString id="shipping.ffl_change_dealer"/>
                    }
                    { (this.state.selectedDealer == null || !fflConsignment) &&
                    <TranslatedString id="shipping.ffl_select_dealer"/>
                    }
                </button>
            </div>

            { (!this.state.isLoading) &&
            <div>
                { <AddressFormModal
                    countries={ countries }
                    countriesWithAutocomplete={ countriesWithAutocomplete }
                    defaultCountryCode={ defaultCountryCode }
                    getFields={ getFields }
                    googleMapsApiKey={ googleMapsApiKey }
                    isLoading={ isLoading }
                    isOpen={ !!itemAddingAddress }
                    onRequestClose={ this.handleCloseAddAddressForm }
                    onSaveAddress={ this.handleSaveAddress }
                /> }

                <Form>
                    <ul className="consignmentList">
                        {this.state.multiShipment ?
                            <div className="multiShip-text">
                                {
                                    (itemsWithoutFFL.length > 0) &&
                                    "Other items in cart will also ship to FFL"
                                }
                                { itemsWithoutFFL.map(item => (
                                    <div className="consignment">
                                        <figure className="consignment-product-figure">
                                            {item.imageUrl && <img alt={item.name} src={item.imageUrl} />}
                                        </figure>
                                        <div className="consignment-product-body">
                                            <h4 className="optimizedCheckout-contentPrimary">{`${item.quantity} x ${item.name}`}</h4>
                                            {(item.options || []).map(({ name: optionName, value, nameId }) => (
                                                <ul
                                                    className="product-options optimizedCheckout-contentSecondary"
                                                    data-test="consigment-item-product-options"
                                                    key={nameId}
                                                >
                                                    <li className="product-option">{`${optionName} ${value}`}</li>
                                                </ul>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        :
                            groupedItemsWithoutFFLEntries.map(([key, items], index) => (
                                <div>
                                    <div className="consignment">
                                        <figure className="consignment-product-figure">
                                            { items[0].imageUrl &&
                                                <img alt={ items[0].imageUrl } src={ items[0].imageUrl } /> }
                                        </figure>
                                        <div className="consignment-product-body">
                                            <h5 className="optimizedCheckout-contentPrimary">
                                                { `${items.length} x ${items[0].name}` }
                                            </h5>
                                        </div>
                                    </div>
                                    {
                                        (index + 1 == groupedItemsWithoutFFLEntries.length) &&
                                        <AddressSelect
                                            addresses={ customer.addresses }
                                            onSelectAddress={ this.handleSelectAddress }
                                            onUseNewAddress={ this.handleUseNewAddress }
                                            selectedAddress={ items[0].consignment && items[0].consignment.shippingAddress}
                                        />
                                    }
                                </div>
                            ))
                        }
                    </ul>
                </Form>
            </div>
        }
        </div> }

        { (this.state.ammoStateFFLRequired == false) && 
            <CustomShippingForm
                onChangeCustomShippingField={ this.onChangeCustomShippingField }
                customShippingFirstNameError={ this.state.customShippingFirstNameError }
                customShippingLastNameError={ this.state.customShippingLastNameError }
                customShippingAddressError={ this.state.customShippingAddressError}
                customShippingCityError={ this.state.customShippingCityError}
                customShippingPostalError={ this.state.customShippingPostalError}
            />
        }

        <ShippingFormFooter
            cartHasChanged={ cartHasChanged }
            isLoading={ isLoading }
            customerMessage={ customerMessage }
            onSubmit={ this.handleMultiShippingSubmit }
            shouldDisableSubmit={ this.shouldDisableSubmit() }
            shouldShowOrderComments={ shouldShowOrderComments }
            shouldShowShippingOptions={ !hasUnassignedLineItems(consignments, cart.lineItems) }
        />

       {
          (this.state.manualFflInput === true) &&
          <Shipping
              cartHasChanged={ this.props.cartHasChanged }
              isMultiShippingMode={ this.props.isMultiShippingMode }
              navigateNextStep={ this.props.navigateNextStep }
              onCreateAccount={ this.props.onCreateAccount }
              onReady={ this.props.onReady }
              onSignIn={ this.props.onSignIn }
              onToggleMultiShipping={ this.props.onToggleMultiShipping }
              onUnhandledError={ this.props.onUnhandledError }
          />
        }

        {
          (this.props.storeHash != "") &&
          <Locator
            storeHash={ this.props.storeHash }
            showLocator={ this.state.showLocator }
            handleCancel={ this.handleCancel }
            selectDealer={ this.selectDealer }
            announcement={ this.state.announcement }
          />
        }
      </section>
    );
  }

  private handleCloseAddAddressForm: () => void = () => {
      this.setState({
          itemAddingAddress: undefined,
      });
  };

  private handleUseNewAddress: (address: Address, itemId: string, itemKey: string) => void = (address, itemId, itemKey) => {
      this.setState({
          itemAddingAddress: {
              key: itemKey,
              itemId,
          },
      });
  };

  private onUseNewAddress: (address: Address, itemId: string) => void = async (address, itemId) => {
      const { unassignItem, onUnhandledError } = this.props;

      try {
          await unassignItem({
              shippingAddress: address,
              lineItems: [{
                  quantity: 1,
                  itemId,
              }],
          });

          location.href = '/account.php?action=add_shipping_address&from=checkout';
      } catch (e) {
          onUnhandledError(new UnassignItemError(e as any));
      }
  };

  private handleSelectAddress: (address: Address, itemId: string, itemKey: string) => Promise<void> = async (address, itemId, itemKey) => {
    const { assignItem, onUnhandledError, getFields } = this.props;
    const FFLItems = this.props.fflConsignmentItems.concat(this.props.ammoConsignmentItems)
    const FFLItemIds = FFLItems.map(item => { return item.itemId });
    const cartLineItems = this.props.cart.lineItems.physicalItems
    // do not include line items with parentID, BigCommerce will automatically assign the address selected from the parent item
    const nonFFLItems = cartLineItems.filter(item => !(FFLItemIds.includes(item.id)) && item.parentId == null);

    const nonFFLItemsMap = nonFFLItems.map(item => {
        let container = {};
        container.itemId = item.id;
        container.quantity = item.quantity;
        return container;
    });

    if (!isValidAddress(address, getFields(address.countryCode))) {
        return onUnhandledError(new AssignItemInvalidAddressError());
    }

    try {
        const { data } = await assignItem({
            address,
            lineItems: nonFFLItemsMap
        });

    } catch (error) {
        if (error instanceof Error) {
            onUnhandledError(new AssignItemFailedError(error));
        }
    }
  };

  private handleSaveAddress: (address: AddressFormValues) => void = async address => {
      const { createCustomerAddress } = this.props;
      const { itemAddingAddress } = this.state;

      if (!itemAddingAddress) {
          return;
      }

      const shippingAddress = mapAddressFromFormValues(address);

      await this.handleSelectAddress(shippingAddress, itemAddingAddress.itemId, itemAddingAddress.key);

      try {
          await createCustomerAddress(shippingAddress);
      } catch (e) {
          this.setState({ createCustomerAddressError: e });
      }

      this.setState({
          itemAddingAddress: undefined,
      });
  };

  private handleMultiShippingSubmit: (values: MultiShippingFormValues) => void = async ({ orderComment }) => {
    const {
        customerMessage,
        updateCheckout,
        navigateNextStep,
        onUnhandledError,
    } = this.props;

    if (this.state.ammoStateFFLRequired == false) {
        if (this.validateCustomShippingFields() == false) {
            break;
        }
    }

    try {
        if (customerMessage !== orderComment) {
            await updateCheckout({ customerMessage: orderComment });
        }

        navigateNextStep(false);
    } catch (error) {
        onUnhandledError(error);
    }
  };

    private validateCustomShippingFields: () => void = () => {
        let isValid = true;
        const fields = [
            "customShippingFirstName",
            "customShippingLastName",
            "customShippingAddress",
            "customShippingCity",
            "customShippingPostal"
        ];

        for (let stateKey of fields){
            if (this.state[stateKey] == "") {
                this.setState({ [`${stateKey}Error`]: true });
                isValid = false;
            }
        }

        return isValid;
    };

  private syncItems: (
      key: string,
      address: Address,
      data: CheckoutStoreSelector
  ) => void = (key, address, data) => {
      const { items: currentItems } = this.state;

      const items = updateShippableItems(
          currentItems,
          {
              updatedItemIndex: currentItems.findIndex((item: any) => item.key === key),
              address,
          },
          {
              cart: data.getCart(),
              consignments: data.getConsignments(),
          }
      );

      if (items) {
          this.setState({ items });
      }
  };
}

export function mapToDealerShippingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutShippingProps | null {
    const {
        data: {
            getCart,
            getCheckout,
            getConfig,
            getCustomer,
            getConsignments,
            getShippingAddress,
            getBillingAddress,
            getShippingAddressFields,
            getShippingCountries,
        },
        statuses: {
            isShippingStepPending,
            isSelectingShippingOption,
            isLoadingShippingOptions,
            isUpdatingConsignment,
            isCreatingConsignments,
            isCreatingCustomerAddress,
            isLoadingShippingCountries,
            isUpdatingBillingAddress,
            isUpdatingCheckout,
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const consignments = getConsignments() || [];
    const customer = getCustomer();
    const cart = getCart();

    if (!checkout || !config || !customer || !cart) {
        return null;
    }

    const {
      checkoutSettings: {
          enableOrderComments,
          features,
          hasMultiShippingEnabled,
          googleMapsApiKey,
      },
    } = config;

    const methodId = getShippingMethodId(checkout);
    const shippableItemsCount = getShippableItemsCount(cart);
    const isLoading = (
        isLoadingShippingOptions() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingBillingAddress() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress()
    );
    const shouldShowMultiShipping = (
        hasMultiShippingEnabled &&
        !methodId &&
        shippableItemsCount > 1 &&
        shippableItemsCount < 50
    );
    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    const shippingAddress = !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    return {
        assignItem: checkoutService.assignItemsToAddress,
        billingAddress: getBillingAddress(),
        cart,
        consignments,
        countries: getShippingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        deinitializeShippingMethod: checkoutService.deinitializeShipping,
        deleteConsignment: checkoutService.deleteConsignment,
        updateConsignment: checkoutService.updateConsignment,
        getFields: getShippingAddressFields,
        googleMapsApiKey,
        initializeShippingMethod: checkoutService.initializeShipping,
        isGuest: customer.isGuest,
        isInitializing: isLoadingShippingCountries() || isLoadingShippingOptions(),
        isLoading,
        isShippingStepPending: isShippingStepPending(),
        methodId,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowAddAddressInCheckout: features['CHECKOUT-4726.add_address_in_multishipping_checkout'],
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        createCustomerAddress: checkoutService.createCustomerAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
    };
}

export default withCheckout(mapToDealerShippingProps)(DealerShipping);
