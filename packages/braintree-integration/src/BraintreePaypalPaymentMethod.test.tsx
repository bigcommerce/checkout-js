import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { createBraintreePaypalPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/contexts';
import { InstrumentDeclinedError } from '@bigcommerce/checkout/error-handling-utils';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
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
    let localeContext: LocaleContextType;

    const paymentForm: PaymentFormService = getPaymentFormServiceMock();
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const defaultProps = {
        checkoutService,
        checkoutState,

        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getBraintreePaypalPaymentMethod(),
        onUnhandledError: jest.fn(),
        paymentForm,
    };

    beforeEach(() => {
        const providerError = new Error('INSTRUMENT_DECLINED');

        eventEmitter = new EventEmitter();
        jest.spyOn(paymentForm, 'validateForm').mockResolvedValue({});
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
                onValidate: expect.any(Function),
                onInitButton: expect.any(Function),
                containerId: '#checkout-payment-continue',
            },
        });
    });

    it('throws specific error text when receive INSTRUMENT_DECLINED error message', () => {
        render(<BraintreePaypalPaymentMethodTest />);

        eventEmitter.emit('onError');

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(new InstrumentDeclinedError());
    });

    it('passed form validation by calling onValidate callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onValidate', async (resolve: () => void, reject: () => void) => {
                if (options.braintree?.onError) {
                    await options.braintree.onValidate?.(resolve, reject);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const validationSuccess = jest.fn();

        render(<BraintreePaypalPaymentMethodTest />);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        eventEmitter.emit('onValidate', validationSuccess, () => {});

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.paymentForm.validateForm).toHaveBeenCalled();
        expect(validationSuccess).toHaveBeenCalled();
    });

    it('is not passing form validation by calling onValidate callback', async () => {
        jest.spyOn(paymentForm, 'validateForm').mockResolvedValue({
            field1: 'validation error message',
            field2: 'validation error message',
        });

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onValidate', async (resolve: () => void, reject: () => void) => {
                if (options.braintree?.onError) {
                    await options.braintree.onValidate?.(resolve, reject);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const validationReject = jest.fn();

        render(<BraintreePaypalPaymentMethodTest />);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        eventEmitter.emit('onValidate', () => {}, validationReject);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.validateForm).toHaveBeenCalled();
        expect(paymentForm.setSubmitted).toHaveBeenCalled();
        expect(paymentForm.setFieldTouched).toHaveBeenCalledTimes(2);
        expect(validationReject).toHaveBeenCalled();
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
