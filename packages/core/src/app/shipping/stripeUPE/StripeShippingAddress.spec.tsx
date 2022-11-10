import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
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

        jest.mock('../common/dom', () => ({
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
                        complete: true,
                        elementType: 'shipping',
                        empty: false,
                        isNewAddress: true,
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
                        complete: true,
                        elementType: 'shipping',
                        empty: false,
                        isNewAddress: false,
                        value: {
                            address: {
                                city: 'string',
                                country: 'US',
                                line1: 'string',
                                postal_code: 'string',
                                state: 'string',
                            },
                            name: 'cosme fulanito',
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
