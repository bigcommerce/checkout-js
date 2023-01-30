// @ts-nocheck
import { Address, AddressRequestBody, Cart, CheckoutRequestBody, CheckoutStoreSelector, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, ConsignmentUpdateRequestBody, Country, Customer, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions, RequestOptions } from '@bigcommerce/checkout-sdk';
import React, { lazy } from 'react';
import { noop } from 'lodash';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import getShippingMethodId from '../../shipping/getShippingMethodId';
import getShippableItemsCount from '../../shipping/getShippableItemsCount';
import hasUnassignedLineItems from '../../shipping/hasUnassignedLineItems';
import hasSelectedShippingOptions from '../../shipping/hasSelectedShippingOptions';
import updateShippableItems from '../../shipping/updateShippableItems';
import ItemAddressSelect from '../../shipping/ItemAddressSelect';
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
}

class DealerShipping extends React.PureComponent<DealerProps & WithCheckoutShippingProps, DealerState> {

  static getDerivedStateFromProps(
      { cart, consignments, fflConsignmentItems }: DealerProps & WithCheckoutShippingProps,
      state: DealerState
  ) {
      if (!state || !state.items || getShippableItemsCount(cart) !== state.items.length) {
          const fflConsignment = consignments.filter(
              item => fflConsignmentItems.some((fflItem: any) => item.lineItemIds.includes(fflItem.itemId))
          )[0];

          let selectedDealer = null;
          if (fflConsignment) {
            selectedDealer = fflConsignment.shippingAddress;
          }
          return {
            ...state,
            items: getShippableLineItems(cart, consignments),
            selectedDealer: selectedDealer
          };
      }

      return null;
  }

  constructor(props: any) {
    super(props);

    this.state = {
      manualFflInput: false,
      showLocator: false,
      selectedDealer: null,
      isUpdatingShippingData: false,
      isLoading: true,
      items: [],
      itemAddingAddress: null,
      createCustomerAddressError: null,
      announcement: '',
      multiShipment: false
     };

    fetch(`https://${process.env.HOST}/store-front/api/stores/${this.props.storeHash}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        this.setState({
            announcement: data.announcement,
            multiShipment: data.multi_shipment,
            isLoading: false
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
      lineItems: this.state.multiShipment ? allCartItems : this.props.fflConsignmentItems,
      shippingAddress: dealer
    }

    if (!isValidAddress(dealer, getFields(dealer.countryCode))) {
        return onUnhandledError(new AssignItemInvalidAddressError());
    }

    try {
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
      consignments,
      fflConsignmentItems,
      cart,
      cartHasChanged,
      shouldShowOrderComments,
      isLoading,
      getFields,
      defaultCountryCode,
      customerMessage,
      customer,
      countries,
      countriesWithAutocomplete,
      googleMapsApiKey
    } = this.props;

    const items = getShippableLineItems(cart, consignments);

    const itemsWithoutFFL = items.filter(
        item => !fflConsignmentItems.some((fflItem: any) => item.id === fflItem.itemId)
    );

    const itemsWithFFL = items.filter(
        item => fflConsignmentItems.some((fflItem: any) => item.id === fflItem.itemId)
    );

    const fflConsignment = consignments.filter(
        item => fflConsignmentItems.some((fflItem: any) => item.lineItemIds.includes(fflItem.itemId))
    )[0];

    const { itemAddingAddress } = this.state;

    return (
      <section className="ffl-section checkout-form">
        { ((this.state.manualFflInput === false) && (this.state.selectedDealer == null || !fflConsignment)) &&
          <div className="alertBox alertBox--error alertBox--font-color-black">
            <div className="alertBox-column alertBox-icon">
              <div className="icon">
              </div>
            </div>
            { itemsWithFFL.map(item => (
                <li key={ item.key }>
                    <ItemFFL
                        item={ item }
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
            { itemsWithFFL.map(item => (
                <li key={ item.key }>
                    <ItemFFL
                        item={ item }
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
                            Other items in cart will also ship to FFL
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
                        itemsWithoutFFL.map(item => (
                            <li key={ item.key }>
                                { (!this.state.multiShipment) &&
                                    <ItemAddressSelect
                                        addresses={ customer.addresses }
                                        item={ item }
                                        onSelectAddress={ this.handleSelectAddress }
                                        onUseNewAddress={ this.handleUseNewAddress }
                                    />
                                }
                            </li>
                        ))
                    }
                </ul>

                <ShippingFormFooter
                    cartHasChanged={ cartHasChanged }
                    isLoading={ isLoading }
                    customerMessage={ customerMessage }
                    onSubmit={ this.handleMultiShippingSubmit }
                    shouldDisableSubmit={ this.shouldDisableSubmit() }
                    shouldShowOrderComments={ shouldShowOrderComments }
                    shouldShowShippingOptions={ !hasUnassignedLineItems(consignments, cart.lineItems) }
                />
            </Form>
          </div>
       }
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
          (this.props.storeHash != '') &&
          <Locator
            storeHash={ this.props.storeHash }
            showLocator={ this.state.showLocator }
            handleCancel={ this.handleCancel }
            selectDealer={ this.selectDealer }
            announcement={ this.state.announcement }
          />
        }

      </section>);
  }

  private handleCloseAddAddressForm: () => void = () => {
      this.setState({
          itemAddingAddress: undefined,
      });
  };

  private handleUseNewAddress: (address: Address, itemId: string, itemKey: string) => void = (address, itemId, itemKey) => {
      const { shouldShowAddAddressInCheckout } = this.props;

      if (!shouldShowAddAddressInCheckout) {
          this.onUseNewAddress(address, itemId);
          return;
      }

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
      const {
          consignments,
          assignItem,
          updateConsignment,
          onUnhandledError,
          getFields,
      } = this.props;

      if (!isValidAddress(address, getFields(address.countryCode))) {
          return onUnhandledError(new AssignItemInvalidAddressError());
      }

      try {
          let response = null;
          const consignment = consignments.filter(
              item => {
                // Right now isEqualAddress(item.shippingAddress, address) doesn't work for our case
                // We may check if the isEqualAddress function changes on the future
                return (item.shippingAddress.address1 === address.address1)
                  && (item.shippingAddress.address2 === address.address2)
                  && (item.shippingAddress.postalCode === address.postalCode);
          })[0];

          if(!!consignment) {
            const lineItems = consignment.lineItemIds.map(itemId => {
              return {
               itemId,
               quantity: 1
              };
            });
            lineItems.push({
              itemId,
              quantity: 1
            });
              response = await updateConsignment({
              id: consignment.id,
              lineItems,
              shippingAddress: address,
            });
          } else {
              response = await assignItem({
                shippingAddress: address,
                lineItems: [{
                    itemId,
                    quantity: 1,
                }],
            });
          }

          this.syncItems(itemKey, address, response.data);
      } catch (e) {
          onUnhandledError(new AssignItemFailedError(e as any));
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

      try {
          if (customerMessage !== orderComment) {
              await updateCheckout({ customerMessage: orderComment });
          }

          navigateNextStep(false);
      } catch (error) {
          onUnhandledError(error);
      }
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
