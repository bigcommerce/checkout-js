import { createCheckoutService, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, shallow, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { StaticAddress } from '../address/';
import { getFormFields } from '../address/formField.mock';
import { CheckoutProvider } from '../checkout';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getConsignment } from './consignment.mock';
import { getShippingAddress } from './shipping-addresses.mock';
import RemoteShippingAddress from './RemoteShippingAddress';
import ShippingAddress, { ShippingAddressProps } from './ShippingAddress';
import ShippingAddressForm from './ShippingAddressForm';
import StaticAddressEditable from './StaticAddressEditable';
import StripeupeShippingAddress from './StripeupeShippingAddress';

describe('ShippingAddress Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let wrapperComponent: ReactWrapper;
    let TestComponent: FunctionComponent<Partial<ShippingAddressProps>>;
    let defaultProps: ShippingAddressProps;

    beforeAll(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            consignments: [ getConsignment() ],
            addresses: getCustomer().addresses,
            shippingAddress: {
                ...getShippingAddress(),
                address1: 'x',
            },
            countriesWithAutocomplete: [],
            isLoading: false,
            customerEmail: 'foo@test.com',
            step: { isActive: false,
                isComplete: false,
                isEditable: false,
                isRequired: true,
                type: CheckoutStepType.Shipping },
            isStripeLinkEnabled: false,
            isStripeLoading: jest.fn(),
            shouldDisableSubmit: false,
            onSubmit: noop,
            countries: [{
                code: 'US',
                name: 'United States',
                hasPostalCodes: true,
                subdivisions: [{code: 'bar', name: 'foo' }],
                requiresState: true,
                }],
            isShippingStepPending: false,
            hasRequestedShippingOptions: false,
            formFields: getFormFields(),
            onAddressSelect: jest.fn(),
            onFieldChange: jest.fn(),
            initialize: jest.fn(),
            deinitialize: jest.fn(),
            onUnhandledError: jest.fn(),
            onUseNewAddress: jest.fn(),
    };

        TestComponent = props => (
        <CheckoutProvider checkoutService={ checkoutService }>
            <LocaleContext.Provider value={ localeContext }>
                  <Formik
                      initialValues={ {} }
                      onSubmit={ noop }
                  >
                    <ShippingAddress
                        { ...props }
                        { ...defaultProps }
                    />
                </Formik>
            </LocaleContext.Provider>
        </CheckoutProvider>
        );
    });

    describe('when no method id is provided', () => {
        it('renders ShippingAddressForm with expected props', () => {
            const component = shallow(<ShippingAddress { ...defaultProps } />);

            expect(component.find(ShippingAddressForm).props()).toEqual(
                expect.objectContaining({
                    formFields: defaultProps.formFields,
                    addresses: defaultProps.addresses,
                    onUseNewAddress: defaultProps.onUseNewAddress,
                    address: defaultProps.shippingAddress,
                })
            );
        });

        it('calls onAddressSelect when an address is selected', async () => {
            wrapperComponent = mount(<TestComponent />);
            wrapperComponent.find('#addressToggle').simulate('click');
            wrapperComponent.find('#addressDropdown li').at(1).find('a').simulate('click');

            await new Promise(resolve => process.nextTick(resolve));

            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('does not render RemoteShippingAddress', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } />
                </Formik>
            );

            expect(component.find(RemoteShippingAddress).length).toEqual(0);
        });

        it('does not render StaticAddress if method id is not sent', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } />
                </Formik>
            );

            expect(component.find(StaticAddress).length).toEqual(0);
        });
    });

    describe('when method id is provided', () => {
        it('renders RemoteShippingAddress with expected props', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } methodId="amazon" />
                </Formik>
            );

            expect(component.find(RemoteShippingAddress).props()).toEqual(
                expect.objectContaining({
                    containerId: 'addressWidget',
                    methodId: 'amazon',
                    deinitialize: defaultProps.deinitialize,
                    formFields: defaultProps.formFields,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalledWith({
                methodId: 'amazon',
                amazon: {
                    container: 'addressWidget',
                    onError: defaultProps.onUnhandledError,
                },
            });
        });

        it('renders StripeShippingAddress with expected props', () => {
            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...stripeProps } methodId="stripeupe" />
                </Formik>
            );

            expect(component.find(StripeupeShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                    formFields: defaultProps.formFields,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalledWith({
                methodId: 'stripeupe',
                stripeupe: {
                    container: 'StripeUpeShipping',
                    onChangeShipping: expect.any(Function),
                    availableCountries: 'US',
                },
            });
        });

        it('renders StripeShippingAddress with initialize props', async () => {
            defaultProps.initialize = jest.fn((options) => {
                options.stripeupe?.onChangeShipping({
                        complete: true,
                        elementType: 'shipping',
                        empty: false,
                        isNewAddress: false,
                        value: {
                            address: {
                                city: 'string',
                                country: 'US',
                                line1: 'string',
                                line2: 'string',
                                postal_code: 'string',
                                state: 'string',
                            },
                            name: 'cosme fulanito',
                        },
                    }
                );
            });
            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...stripeProps } methodId="stripeupe"/>
                </Formik>
            );

            expect(component.find(StripeupeShippingAddress).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                    formFields: defaultProps.formFields,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('does not render ShippingAddressForm', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } methodId="amazon" />
                </Formik>
            );

            expect(component.find(ShippingAddressForm).length).toEqual(0);
        });

        it('renders a StaticAddressEditable if methodId is amazon pay', () => {
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <ShippingAddress { ...defaultProps } methodId="amazonpay" />
                </Formik>
            );

            expect(component.find(StaticAddressEditable).length).toEqual(1);
        });
    });
});
