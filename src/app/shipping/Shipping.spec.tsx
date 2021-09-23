import { createCheckoutService, BillingAddress, Cart, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getAddressFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { CheckoutProvider } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getConsignment } from './consignment.mock';
import { getShippingAddress } from './shipping-addresses.mock';
import Shipping, { ShippingProps, WithCheckoutShippingProps } from './Shipping';
import ShippingForm from './ShippingForm';

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
            navigateNextStep: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'loadShippingAddressFields')
            .mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutService, 'loadShippingOptions')
            .mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutService, 'deleteConsignment')
            .mockResolvedValue({} as CheckoutSelectors);

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue({
                ...getCart(),
                lineItems: {
                    physicalItems: [ {
                        ...getPhysicalItem(),
                        quantity: 3,
                    }],
                },
            } as Cart);

        jest.spyOn(checkoutState.data, 'getShippingAddress')
            .mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutState.data, 'getBillingAddress')
            .mockReturnValue(undefined);

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getShippingAddressFields')
            .mockReturnValue(getAddressFormFields());

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue({ ...getCustomer(), addresses: [] });

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutService, 'updateBillingAddress').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'updateCheckout').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'updateShippingAddress').mockResolvedValue({} as CheckoutSelectors);

        ComponentTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <Shipping { ...props } />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('loads shipping data  when component is mounted', () => {
        mount(<ComponentTest { ...defaultProps } />);

        expect(checkoutService.loadShippingAddressFields)
            .toHaveBeenCalled();

        expect(checkoutService.loadShippingOptions)
            .toHaveBeenCalled();
    });

    it('triggers callback when shipping data is loaded', async () => {
        const handleReady = jest.fn();

        mount(<ComponentTest { ...defaultProps } onReady={ handleReady } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(handleReady).toHaveBeenCalled();
    });

    it('does not render ShippingForm while initializing', () => {
        jest.spyOn(checkoutService.getState().statuses, 'isLoadingShippingCountries')
            .mockReturnValue(true);

        component = mount(<ComponentTest { ...defaultProps } />);

        expect(component.find(ShippingForm).length)
            .toEqual(0);
    });

    it('updates shipping and billing if shipping address is changed and billingSameAsShipping', async () => {
        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'bar',
        }));
        expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'bar',
        }));
    });

    it('updates only shipping if shipping address is changed and billingSameAsShipping is false', async () => {
        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('input[name="billingSameAsShipping"]')
                .simulate('change', { target: { checked: false, name: 'billingSameAsShipping' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'bar',
        }));
    });

    it('calls updateCheckout if comment changes', async () => {
        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('input[name="orderComment"]')
            .simulate('change', { target: { value: 'foo', name: 'orderComment' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.updateCheckout).toHaveBeenCalledWith({ customerMessage: 'foo' });
    });

    it('calls onUnhandledError if failures', async () => {
        jest.spyOn(checkoutService, 'updateShippingAddress').mockRejectedValue(new Error());

        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.navigateNextStep).not.toHaveBeenCalled();
        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('calls navigateNextStep if no failures', async () => {
        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('input[name="shippingAddress.firstName"]')
            .simulate('change', { target: { value: 'bar', name: 'shippingAddress.firstName' } });

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(true);
    });

    it('calls only navigateNextStep when no changes', async () => {
        jest.spyOn(checkoutService.getState().data, 'getShippingAddress')
            .mockReturnValue(getShippingAddress());

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress')
            .mockReturnValue(getShippingAddress() as BillingAddress);

        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        component.find('form')
            .simulate('submit');

        await new Promise(resolve => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateShippingAddress).not.toHaveBeenCalled();
        expect(checkoutService.updateCheckout).not.toHaveBeenCalled();
        expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(true);
    });

    it('calls delete consignment if consignments exist when adding a new address', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
        });

        jest.spyOn(checkoutState.data, 'getConsignments')
        .mockReturnValue([getConsignment()]);

        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));

        component.update();
        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li').first().find('a').simulate('click');

        await new Promise(resolve => process.nextTick(resolve));
        component.update();

        expect(checkoutService.deleteConsignment).toHaveBeenCalled();
    });

    it('does not call delete consignment if consignment doesnot exist when adding a new address', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
        });

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([]);

        component = mount(<ComponentTest { ...defaultProps } />);
        await new Promise(resolve => process.nextTick(resolve));

        component.update();
        component.find('#addressToggle').simulate('click');
        component.find('#addressDropdown li').first().find('a').simulate('click');

        expect(checkoutService.deleteConsignment).not.toHaveBeenCalled();
    });

    describe('when multishipping mode is on', () => {
        describe('when shopper is signed', () => {
            beforeEach(async () => {
                component = mount(<ComponentTest { ...defaultProps } isMultiShippingMode={ true } />);
                await new Promise(resolve => process.nextTick(resolve));
                component.update();
            });

            it('calls updateCheckout and navigateNextStep', async () => {
                component.find('input[name="orderComment"]')
                    .simulate('change', { target: { value: 'foo', name: 'orderComment' } });

                component.find('form')
                    .simulate('submit');

                await new Promise(resolve => process.nextTick(resolve));

                expect(checkoutService.updateCheckout).toHaveBeenCalledWith({ customerMessage: 'foo' });
                expect(defaultProps.navigateNextStep).toHaveBeenCalledWith(false);
            });

            it('calls onToggleMultiShipping when link is clicked', () => {
                expect(component.find('[data-test="shipping-mode-toggle"]').text())
                    .toEqual('Ship to a single address');

                component.find('[data-test="shipping-mode-toggle"]').simulate('click');

                expect(defaultProps.onToggleMultiShipping).toHaveBeenCalled();
            });

            it('renders multishipping header', () => {
                expect(component.find('[data-test="shipping-address-heading"]').text())
                    .toEqual('Choose where to ship each item');
            });

            it('renders shipping form', () => {
                expect(component.find(ShippingForm).length).toEqual(1);
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

                component = mount(<ComponentTest { ...multipleConsignmentsProp } isMultiShippingMode={ true } />);
                await new Promise(resolve => process.nextTick(resolve));
                component.update();

                component.find('[data-test="shipping-mode-toggle"]').simulate('click');

                expect(checkoutService.updateShippingAddress).toHaveBeenCalledWith(consignments[0].shippingAddress);
            });
        });

        describe('when is guest user', () => {
            beforeEach(async () => {
                jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
                    ...getCustomer(),
                    isGuest: true,
                });

                component = mount(<ComponentTest { ...defaultProps } isMultiShippingMode={ true } />);
                await new Promise(resolve => process.nextTick(resolve));
                component.update();
            });

            it('renders multishipping header', () => {
                expect(component.find('[data-test="shipping-address-heading"]').text())
                    .toEqual('Please sign in first');
            });

            it('doest render shipping form', () => {
                expect(component.find(ShippingForm).length).toEqual(1);
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

                component = mount(<ComponentTest { ...defaultProps } />);
                await new Promise(resolve => process.nextTick(resolve));
                component.update();
            });

            it('does not initialize any shipping address', () => {
                expect(component.find(ShippingForm).prop('address')).toBeFalsy();
            });
        });
    });
});
