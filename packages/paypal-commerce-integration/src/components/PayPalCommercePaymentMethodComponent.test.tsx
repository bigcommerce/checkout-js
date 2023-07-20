import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { EventEmitter } from 'events';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

import { getPayPalCommerceMethod } from '../mocks/paymentMethods.mock';

import PayPalCommercePaymentMethodComponent from './PayPalCommercePaymentMethodComponent';

describe('PayPalCommercePaymentMethodComponent', () => {
    let eventEmitter: EventEmitter;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getPayPalCommerceMethod(),
        onUnhandledError: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: jest.fn() as unknown as PaymentFormService,
        providerOptionsKey: 'paypalcommerce',
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        eventEmitter = new EventEmitter();
    });

    it('initializes PayPalCommerce with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommerce: {
                container: '#checkout-payment-continue',
                onRenderButton: expect.any(Function),
                submitForm: expect.any(Function),
                onError: expect.any(Function),
                onValidate: expect.any(Function),
            },
        });
    });

    it('initializes PayPalCommerce with extended initialization options', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        const newProps = {
            ...props,
            providerOptionsKey: 'paypalcommercealternativemethods',
            providerOptionsData: {
                apmFieldsStyles: {
                    variables: {
                        borderRadius: '4px',
                    },
                },
            },
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommercealternativemethods: {
                container: '#checkout-payment-continue',
                onRenderButton: expect.any(Function),
                onError: expect.any(Function),
                onValidate: expect.any(Function),
                submitForm: expect.any(Function),
                apmFieldsStyles: {
                    variables: {
                        borderRadius: '4px',
                    },
                },
            },
        });
    });

    it('deinitializes PayPalCommerce with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = render(<PayPalCommercePaymentMethodComponent {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('catches error during PayPalCommerce initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<PayPalCommercePaymentMethodComponent {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during PayPalCommerce deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = render(<PayPalCommercePaymentMethodComponent {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('renders provided child component', async () => {
        const testId = 'paypal-commerce-test-id';

        const component = (
            <PayPalCommercePaymentMethodComponent {...props}>
                <div data-test={testId} />
            </PayPalCommercePaymentMethodComponent>
        );

        const { getByTestId } = render(component);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(getByTestId(testId)).toBeInTheDocument();
    });

    it('hides payment submit button by calling onRenderButton callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onRenderButton', () => {
                if (options.paypalcommerce?.onRenderButton) {
                    options.paypalcommerce.onRenderButton();
                }
            });

            return Promise.resolve(checkoutState);
        });

        const hidePaymentSubmitButtonMock = jest.fn();
        const newProps = {
            ...props,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            paymentForm: {
                hidePaymentSubmitButton: hidePaymentSubmitButtonMock,
            } as unknown as PaymentFormService,
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onRenderButton');

        expect(hidePaymentSubmitButtonMock).toHaveBeenCalledWith(props.method, true);
    });

    it('submits payment form by calling submitForm callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('submitForm', () => {
                if (options.paypalcommerce?.submitForm) {
                    options.paypalcommerce.submitForm();
                }
            });

            return Promise.resolve(checkoutState);
        });

        const submitFormMock = jest.fn();
        const setSubmittedMock = jest.fn();
        const newProps = {
            ...props,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            paymentForm: {
                submitForm: submitFormMock,
                setSubmitted: setSubmittedMock,
            } as unknown as PaymentFormService,
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('submitForm');

        expect(setSubmittedMock).toHaveBeenCalledWith(true);
        expect(submitFormMock).toHaveBeenCalled();
    });

    it('disables submit button and throws an error by calling onError callback', async () => {
        const errorMock = new Error();

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.paypalcommerce?.onError) {
                    options.paypalcommerce.onError(errorMock);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const disableSubmitMock = jest.fn();
        const onUnhandledErrorMock = jest.fn();
        const newProps = {
            ...props,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            paymentForm: {
                disableSubmit: disableSubmitMock,
            } as unknown as PaymentFormService,
            onUnhandledError: onUnhandledErrorMock,
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onError');

        expect(disableSubmitMock).toHaveBeenCalled();
        expect(onUnhandledErrorMock).toHaveBeenCalledWith(errorMock);
    });

    it('passed form validation by calling onValidate callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onValidate', async (resolve, reject) => {
                if (options.paypalcommerce?.onError) {
                    await options.paypalcommerce.onValidate(resolve, reject);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const validateFormMock = jest.fn().mockReturnValue({});
        const validationSuccess = jest.fn();
        const newProps = {
            ...props,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            paymentForm: {
                validateForm: validateFormMock,
            } as unknown as PaymentFormService,
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onValidate', validationSuccess, () => {});

        expect(await validateFormMock).toHaveBeenCalled();
        expect(validationSuccess).toHaveBeenCalled();
    });

    it('passed form validation by calling onValidate callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onValidate', async (resolve, reject) => {
                if (options.paypalcommerce?.onError) {
                    await options.paypalcommerce.onValidate(resolve, reject);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const validateFormMock = jest.fn().mockReturnValue({
            field1: 'validation error message',
            field2: 'validation error message',
        });
        const setFieldTouchedMock = jest.fn();
        const setSubmittedMock = jest.fn();
        const validationReject = jest.fn();
        const newProps = {
            ...props,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            paymentForm: {
                setFieldTouched: setFieldTouchedMock,
                setSubmitted: setSubmittedMock,
                validateForm: validateFormMock,
            } as unknown as PaymentFormService,
        };

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onValidate', () => {}, validationReject);

        expect(await validateFormMock).toHaveBeenCalled();
        expect(setSubmittedMock).toHaveBeenCalledWith(true);
        expect(setFieldTouchedMock).toHaveBeenCalledTimes(2);
        expect(validationReject).toHaveBeenCalled();
    });
});
