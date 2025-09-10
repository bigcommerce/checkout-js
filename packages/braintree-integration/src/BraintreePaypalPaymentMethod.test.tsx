import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { createBraintreePaypalPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import { EventEmitter } from 'events';
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
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreePaypalPaymentMethod,
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreePaypalPaymentMethod from './BraintreePaypalPaymentMethod';

describe('BraintreePaypalPaymentMethod', () => {
    let eventEmitter: EventEmitter;
    let BraintreePaypalPaymentMethodTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    let localeContext: LocaleContextType;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const defaultProps = {
        checkoutService,
        checkoutState,

        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getBraintreePaypalPaymentMethod(),
        onUnhandledError: jest.fn(),

        paymentForm: {
            hidePaymentSubmitButton: jest.fn(),
            setSubmitted: jest.fn(),
            submitForm: jest.fn(),
        } as unknown as PaymentFormService,
    };

    beforeEach(() => {
        const providerError = new Error('INSTRUMENT_DECLINED');

        eventEmitter = new EventEmitter();
        paymentForm = getPaymentFormServiceMock();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onRenderButton', () => {
                if (options.braintree?.onRenderButton) {
                    // eslint-disable-next-line
                    options.braintree.onRenderButton();
                }
            });

            eventEmitter.on('onError', () => {
                if (options.braintree?.onError) {
                    options.braintree.onError(providerError);
                }
            });

            eventEmitter.on('submitForm', () => {
                if (options.braintree?.submitForm) {
                    options.braintree.submitForm();
                }
            });

            return Promise.resolve(checkoutState);
        });

        BraintreePaypalPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BraintreePaypalPaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes BraintreePaypalPaymentMethod', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreePaypalPaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createBraintreePaypalPaymentStrategy],
            braintree: {
                onError: expect.any(Function),
                onRenderButton: expect.any(Function),
                submitForm: expect.any(Function),
                containerId: '#checkout-payment-continue',
            },
        });
    });

    it('throws specific error text when receive INSTRUMENT_DECLINED error message', () => {
        render(<BraintreePaypalPaymentMethodTest />);

        eventEmitter.emit('onError');

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(
            new Error(defaultProps.language.translate('payment.errors.instrument_declined')),
        );
    });

    it('hides payment submit button by calling onRenderButton callback', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onRenderButton', () => {
                if (options.braintree?.onRenderButton) {
                    options.braintree.onRenderButton();
                }
            });

            return Promise.resolve(checkoutState);
        });

        render(<BraintreePaypalPaymentMethodTest />);

        eventEmitter.emit('onRenderButton');

        expect(defaultProps.paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(
            defaultProps.method,
            true,
        );
    });

    it('submits payment form by calling submitForm callback', () => {
        render(<BraintreePaypalPaymentMethodTest />);

        eventEmitter.emit('submitForm');

        expect(defaultProps.paymentForm.setSubmitted).toHaveBeenCalledWith(true);
        expect(defaultProps.paymentForm.submitForm).toHaveBeenCalled();
    });
});
