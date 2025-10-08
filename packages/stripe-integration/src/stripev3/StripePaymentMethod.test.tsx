import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createStripeV3PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import StripeV3PaymentMethod from './StripeV3PaymentMethod';

describe('when using StripeV3 payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'pay_now', gateway: PaymentMethodId.StripeV3 };

        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.mock('@bigcommerce/checkout/dom-utils', () => ({
            getAppliedStyles: () => {
                return { color: '#cccccc' };
            },
        }));

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <StripeV3PaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when using alipay component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'alipay',
                gateway: 'stripev3',
                method: 'alipay',
                initializationData: {},
            };
        });

        it('renders as hosted widget method', () => {
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(initializePayment).toHaveBeenCalledWith({
                gatewayId: 'stripev3',
                methodId: 'alipay',
                integrations: [createStripeV3PaymentStrategy],
                stripev3: {
                    containerId: 'stripe-alipay-component-field',
                    options: undefined,
                },
            });
        });
    });

    describe('when using card component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'card',
                gateway: 'stripev3',
                method: 'card',
                initializationData: {
                    useIndividualCardFields: false,
                },
            };
        });

        it('renders as hosted widget method', () => {
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(initializePayment).toHaveBeenCalledWith({
                gatewayId: 'stripev3',
                methodId: 'card',
                integrations: [createStripeV3PaymentStrategy],
                stripev3: {
                    containerId: 'stripe-card-component-field',
                    options: {
                        classes: {
                            base: 'form-input optimizedCheckout-form-input',
                        },
                    },
                },
            });
        });

        it('initializes method with required config when useIndividualCardFields option is true', () => {
            method.initializationData.useIndividualCardFields = true;

            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith({
                gatewayId: method.gateway,
                methodId: method.id,
                integrations: [createStripeV3PaymentStrategy],
                stripev3: {
                    containerId: 'stripe-card-component-field',
                    options: {
                        cardNumberElementOptions: {
                            showIcon: true,
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            placeholder: '',
                            containerId: 'stripe-card-number-component-field',
                        },
                        cardExpiryElementOptions: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            containerId: 'stripe-expiry-component-field',
                        },
                        cardCvcElementOptions: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            placeholder: '',
                            containerId: 'stripe-cvc-component-field',
                        },
                    },
                },
            });
        });
    });

    describe('when using ideal component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'idealBank',
                gateway: 'stripev3',
                method: 'idealBank',
                initializationData: {},
            };
        });

        it('initializes method with required config', () => {
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    integrations: [createStripeV3PaymentStrategy],
                    stripev3: {
                        containerId: 'stripe-idealBank-component-field',
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                        },
                    },
                }),
            );
        });
    });

    describe('when using iban component', () => {
        beforeEach(() => {
            method = {
                ...getPaymentMethod(),
                id: 'iban',
                gateway: 'stripev3',
                method: 'iban',
                initializationData: {},
            };
        });

        it('initializes method with required config', () => {
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    integrations: [createStripeV3PaymentStrategy],
                    stripev3: {
                        options: {
                            classes: {
                                base: 'form-input optimizedCheckout-form-input',
                            },
                            supportedCountries: ['SEPA'],
                        },
                        containerId: 'stripe-iban-component-field',
                    },
                }),
            );
        });
    });
});
