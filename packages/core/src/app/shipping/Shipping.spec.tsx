import {
    BillingAddress,
    Cart,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getAddressFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { PaymentMethodId } from '../payment/paymentMethod';

import { getConsignment } from './consignment.mock';
import Shipping, { ShippingProps, WithCheckoutShippingProps } from './Shipping';
import { getShippingAddress } from './shipping-addresses.mock';
import ShippingForm from './ShippingForm';

jest.mock('./stripeUPE/StripeShipping', () => {
    const StripeShipping = () => {
        return <div />;
    }

    return StripeShipping;
  });

describe('Shipping Component', () => {
    

    let component: ReactWrapper;
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: ShippingProps;
    let ComponentTest: FunctionComponent<ShippingProps> & Partial<WithCheckoutShippingProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();

        checkoutState = checkoutService.getState();

        defaultProps = {
            isBillingSameAsShipping: true,
            isMultiShippingMode: false,
            onToggleMultiShipping: jest.fn(),
            cartHasChanged: false,
            onSignIn: jest.fn(),
            step: { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                type: CheckoutStepType.Shipping },
            providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            isShippingMethodLoading: true,
            navigateNextStep: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'loadShippingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'loadShippingOptions').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        jest.spyOn(checkoutService, 'deleteConsignment').mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        quantity: 3,
                    },
                ],
            },
        } as Cart);

        jest.spyOn(checkoutState.data, 'getShippingAddress').mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(undefined);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getShippingAddressFields').mockReturnValue(
            getAddressFormFields(),
        );

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            addresses: [],
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutService, 'updateBillingAddress').mockResolvedValue(
            {} as CheckoutSelectors,
        );
        jest.spyOn(checkoutService, 'updateCheckout').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'updateShippingAddress').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        ComponentTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <ExtensionProvider checkoutService={checkoutService}>
                        <Shipping {...props} />
                    </ExtensionProvider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders StripeShipping if enabled', async () => {
        const config = getStoreConfig();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            }
        });
        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({ ...getCustomer(), email: '' ,addresses: [] });

        jest.spyOn(checkoutState.data, 'getShippingCountries')
            .mockReturnValue(getCountries())
        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());

        component = mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(component.find('StripeShipping')).toHaveLength(1);
        expect(component.find(ShippingForm)).toHaveLength(0);
    });

    it("doesn't render StripeShipping if it enabled but cart amount is smaller then Stripe requires", async () => {
        const config = getStoreConfig();

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            cartAmount: 0.4,
        } as Cart);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            }
        });
        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({ ...getCustomer(), email: '' ,addresses: [] });

        jest.spyOn(checkoutState.data, 'getShippingCountries')
            .mockReturnValue(getCountries())
        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());

        component = mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(component.find('StripeShipping')).toHaveLength(0);
        expect(component.find(ShippingForm)).toHaveLength(1);
    });

    it('loads shipping data  when component is mounted', () => {
        mount(<ComponentTest {...defaultProps} />);

        expect(checkoutService.loadShippingAddressFields).toHaveBeenCalled();
        expect(checkoutService.loadBillingAddressFields).toHaveBeenCalled();

        expect(checkoutService.loadShippingOptions).toHaveBeenCalled();
    });

    it('loads shipping data when component is mounted and stripeupe is enable', () => {
        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({ ...getCustomer(), email: '' ,addresses: [] });
        jest.spyOn(checkoutState.data, 'getShippingCountries')
            .mockReturnValue([{
            code: 'US',
            name: 'United States',
            hasPostalCodes: true,
            subdivisions: [{code: 'bar', name: 'foo' }],
            requiresState: true,
        }])
        jest.spyOn(checkoutState.data, 'getBillingCountries').mockReturnValue(getCountries());
        mount(<ComponentTest {...defaultProps} />);

        expect(checkoutService.loadShippingAddressFields)
            .toHaveBeenCalled();
        expect(checkoutService.loadBillingAddressFields)
            .toHaveBeenCalled();

        expect(checkoutService.loadShippingOptions)
            .toHaveBeenCalled();
    });

    it('triggers callback when shipping data is loaded', async () => {
        const handleReady = jest.fn();

        mount(<ComponentTest {...defaultProps} onReady={handleReady} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleReady).toHaveBeenCalled();
    });

    it('does not render ShippingForm while initializing', () => {
        jest.spyOn(
            checkoutService.getState().statuses,
            'isLoadingShippingCountries',
        ).mockReturnValue(true);

        component = mount(<ComponentTest {...defaultProps} />);

        expect(component.find(ShippingForm)).toHaveLength(0);
    });

    it('updates shipping and billing if shipping address is changed and billingSameAsShipping', async () => {
        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component
            .find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'bar',
            }),
        );
        expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'bar',
            }),
        );
    });

    it('updates only shipping if shipping address is changed and billingSameAsShipping is false', async () => {
        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component
            .find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component
            .find('input[name="billingSameAsShipping"]')
            .simulate('change', { target: { checked: false, name: 'billingSameAsShipping' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'bar',
            }),
        );
    });

    it('calls updateShippingAddress if shouldSaveAddress changes', async () => {
        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        const saveAddressField = component.find('input[name="shippingAddress.shouldSaveAddress"]');
        const currentValue = saveAddressField.get(0).props.value;
        const changedValue = currentValue === 'true' ? 'false' : 'true';

        saveAddressField.simulate('change', {
            target: { value: changedValue, name: 'shippingAddress.shouldSaveAddress' },
        });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(
            expect.objectContaining({ shouldSaveAddress: changedValue }),
        );
    });

    it('calls updateCheckout if comment changes', async () => {
        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component
            .find('input[name="orderComment"]')
            .simulate('change', { target: { value: 'foo', name: 'orderComment' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateCheckout).toHaveBeenCalledWith({ customerMessage: 'foo' });
    });

    it('calls onUnhandledError if failures', async () => {
        jest.spyOn(checkoutService, 'updateShippingAddress').mockRejectedValue(new Error());

        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component
            .find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.navigateNextStep).not.toHaveBeenCalled();
        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('calls navigateNextStep if no failures', async () => {
        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component
            .find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(true);
    });

    it('calls only navigateNextStep when no changes', async () => {
        jest.spyOn(checkoutService.getState().data, 'getShippingAddress').mockReturnValue(
            getShippingAddress(),
        );

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
            getShippingAddress() as BillingAddress,
        );

        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateShippingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateCheckout).not.toHaveBeenCalled();
        expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(true);
    });

    it('calls delete consignment if consignments exist when adding a new address', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        component.update();
        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li').first().find('a').simulate('click');

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(checkoutService.deleteConsignment).toHaveBeenCalled();
    });

    it('does not call delete consignment if consignment doesnot exist when adding a new address', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
        });

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([]);

        component = mount(<ComponentTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        component.update();
        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li').first().find('a').simulate('click');

        expect(checkoutService.deleteConsignment).not.toHaveBeenCalled();
    });

    describe('when hasMultiShippingEnabled is enabled', () => {
        beforeEach(async () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    hasMultiShippingEnabled: true,
                },
            })
        });

        it('shows multi address shipping link for more than 50 cart items', async () => {
            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...getCart(),
                lineItems: {
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            quantity: 51,
                        },
                    ],
                },
            } as Cart);
            component = mount(<ComponentTest {...defaultProps} />);
            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find('[data-test="shipping-mode-toggle"]').text()).toBe(
                'Ship to multiple addresses',
            );
        });

        describe('when multishipping mode is on', () => {
            describe('when shopper is signed', () => {
                beforeEach(async () => {
                    component = mount(<ComponentTest {...defaultProps} isMultiShippingMode={true} />);
                    await new Promise((resolve) => process.nextTick(resolve));
                    component.update();
                });

                it('calls updateCheckout and navigateNextStep', async () => {
                    component
                        .find('input[name="orderComment"]')
                        .simulate('change', { target: { value: 'foo', name: 'orderComment' } });

                    component.find('form').simulate('submit');

                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(checkoutService.updateCheckout).toHaveBeenCalledWith({
                        customerMessage: 'foo',
                    });
                    expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(false);
                });

                it('calls onToggleMultiShipping when link is clicked', () => {
                    expect(component.find('[data-test="shipping-mode-toggle"]').text()).toBe(
                        'Ship to a single address',
                    );

                    component.find('[data-test="shipping-mode-toggle"]').simulate('click');

                    expect(defaultProps.onToggleMultiShipping).toHaveBeenCalled();
                });

                it('renders multishipping header', () => {
                    expect(component.find('[data-test="shipping-address-heading"]').text()).toBe(
                        'Choose where to ship each item',
                    );
                });

                it('renders shipping form', () => {
                    expect(component.find(ShippingForm)).toHaveLength(1);
                });

                it('updates shipping if shopper turns off multishipping mode with multiple consignments', async () => {
                    const consignments = [
                        { ...getConsignment(), id: 'foo' },
                        { ...getConsignment(), id: 'bar' },
                        { ...getConsignment(), id: 'foobar' },
                    ];
                    const multipleConsignmentsProp = {
                        ...defaultProps,
                        consignments,
                    };

                    component = mount(
                        <ComponentTest {...multipleConsignmentsProp} isMultiShippingMode={true} />,
                    );
                    await new Promise((resolve) => process.nextTick(resolve));
                    component.update();

                    component.find('[data-test="shipping-mode-toggle"]').simulate('click');

                    expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(
                        consignments[0].shippingAddress,
                    );
                });
            });

            describe('when is guest user', () => {
                beforeEach(async () => {
                    jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
                        ...getCustomer(),
                        isGuest: true,
                    });

                    component = mount(<ComponentTest {...defaultProps} isMultiShippingMode={true} />);
                    await new Promise((resolve) => process.nextTick(resolve));
                    component.update();
                });

                it('renders multishipping header', () => {
                    expect(component.find('[data-test="shipping-address-heading"]').text()).toBe(
                        'Please sign in first',
                    );
                });

                it('doest render shipping form', () => {
                    expect(component.find(ShippingForm)).toHaveLength(1);
                });
            });

            describe('when there are multiple consignments', () => {
                beforeEach(async () => {
                    jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([
                        getConsignment(),
                        getConsignment(),
                    ]);

                    jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
                        ...getStoreConfig(),
                        checkoutSettings: {
                            ...getStoreConfig().checkoutSettings,
                            hasMultiShippingEnabled: false,
                        },
                    });

                    component = mount(<ComponentTest {...defaultProps} />);
                    await new Promise((resolve) => process.nextTick(resolve));
                    component.update();
                });

                it('does not initialize any shipping address', () => {
                    expect(component.find(ShippingForm).prop('address')).toBeFalsy();
                });
            });
        });
    });
});
