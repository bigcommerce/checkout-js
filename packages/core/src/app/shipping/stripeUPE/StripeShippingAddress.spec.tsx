import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import CheckoutStepType from '../../checkout/CheckoutStepType';
import { getStoreConfig } from '../../config/config.mock';
import { getConsignment } from '../consignment.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import StripeShippingAddress, { StripeShippingAddressProps } from './StripeShippingAddress';
import StripeShippingAddressDisplay from './StripeShippingAddressDisplay';

describe('StripeShippingAddress Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let wrapperComponent: ReactWrapper;
    let TestComponent: FunctionComponent<Partial<StripeShippingAddressProps>>;
    let defaultProps: StripeShippingAddressProps;
    const dummyElement = document.createElement('div');
    const stripeEvent = {
        complete: true,
        elementType: 'shipping',
        empty: false,
        isNewAddress: false,
        phoneFieldRequired: false,
        value: {
            address: {
                city: 'string',
                country: 'US',
                line1: 'string',
                postal_code: 'string',
                state: 'string',
            },
            name: 'cosme fulanito',
            phone: '',
        },
    };

    beforeAll(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            consignments: [getConsignment()],
            shippingAddress: {
                ...getShippingAddress(),
                address1: 'x',
            },
            step: { isActive: false,
                isComplete: false,
                isEditable: false,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Shipping },
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
            onAddressSelect: jest.fn(),
            initialize: jest.fn(),
            deinitialize: jest.fn(),
        };

        jest.mock('@bigcommerce/checkout/dom-utils', () => ({
            getAppliedStyles: () => {
                return { color: '#cccccc' };
            },
        }));
        jest.spyOn(document, 'getElementById')
            .mockReturnValue(dummyElement);

        TestComponent = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <StripeShippingAddress {...props} {...defaultProps} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when method id is provided', () => {
        it('renders StripeShippingAddress with expected props', () => {
            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } methodId="stripeupe" />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalledWith({
                methodId: 'stripeupe',
                stripeupe: {
                    container: 'StripeUpeShipping',
                    onChangeShipping: expect.any(Function),
                    availableCountries: 'US',
                    getStyles: expect.any(Function),
                    getStripeState: expect.any(Function),
                    gatewayId: 'stripeupe',
                    methodId: 'card',
                },
            });
        });

        it('renders StripeShippingAddress with initialize props', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const { getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                        value: { ...stripeEvent.value, address: { ...stripeEvent.value.address, line2: 'string' } },
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('renders StripeShippingAddress with initialize props and when page is reloaded', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const { getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                        isNewAddress: true,
                        value: { ...stripeEvent.value, address: { ...stripeEvent.value.address, line2: 'string' } },
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('renders StripeShippingAddress with initialize props without last name', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const { getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                        value: { ...stripeEvent.value, name: 'cosme' },
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('renders StripeShippingAddress with initialize props when phone is required', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const { getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                        phoneFieldRequired: true,
                        value: { ...stripeEvent.value, phone: '+523333333333' },
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('renders StripeShippingAddress with initialize props when phone is not required', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const { getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });

        it('renders StripeShippingAddress with initialize props with split name', async () => {
            defaultProps.initialize = jest.fn((options) => {
                const {getStyles = noop, onChangeShipping = noop} = options.stripeupe || {};

                onChangeShipping({
                        ...stripeEvent,
                        value: {...stripeEvent.value, firstName: 'cosme', lastName: 'Fulanito'},
                        display: {
                            name: 'split',
                        },
                    }
                );
                getStyles();

                return Promise.resolve(checkoutService.getState());
            });

            const stripeProps = {...defaultProps, isStripeLinkEnabled: true, customerEmail: ''};
            const component = mount(
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <StripeShippingAddress { ...stripeProps } />
                </Formik>
            );

            expect(component.find(StripeShippingAddressDisplay).props()).toEqual(
                expect.objectContaining({
                    methodId: 'stripeupe',
                    deinitialize: defaultProps.deinitialize,
                })
            );

            expect(defaultProps.initialize).toHaveBeenCalled();
            expect(defaultProps.onAddressSelect).toHaveBeenCalled();
        });
    });
});
