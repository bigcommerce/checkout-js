import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { EventEmitter } from 'events';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import { getBraintreeLocalMethodMock } from './mocks/braintreeLocalMethodsMocks';

import { BraintreeLocalPaymentMethod } from './index';

describe('BraintreeLocalMethod', () => {
    let eventEmitter: EventEmitter;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        checkoutService,
        checkoutState,

        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getBraintreeLocalMethodMock(),
        onUnhandledError: jest.fn(),

        paymentForm: jest.fn() as unknown as PaymentFormService,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });

    it('initializes BraintreeLocalMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeLocalPaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            braintreelocalmethods: {
                container: '#checkout-payment-continue',
                buttonText: props.language.translate('payment.continue_with_brand', {
                    brandName: props.method.id,
                }),
                onRenderButton: expect.any(Function),
                submitForm: expect.any(Function),
                onError: expect.any(Function),
            },
        });
    });

    it('deinitializes BraintreeLocalMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = render(<BraintreeLocalPaymentMethod {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('catches error during BraintreeLocalMethod initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<BraintreeLocalPaymentMethod {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during BraintreeLocalMethod deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = render(<BraintreeLocalPaymentMethod {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('hides payment submit button by calling onRenderButton callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onRenderButton', () => {
                if (options.braintreelocalmethods?.onRenderButton) {
                    options.braintreelocalmethods.onRenderButton();
                }
            });

            return Promise.resolve(checkoutState);
        });

        const hidePaymentSubmitButtonMock = jest.fn();
        const newProps = {
            ...props,

            paymentForm: {
                hidePaymentSubmitButton: hidePaymentSubmitButtonMock,
            } as unknown as PaymentFormService,
        };

        render(<BraintreeLocalPaymentMethod {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onRenderButton');

        expect(hidePaymentSubmitButtonMock).toHaveBeenCalledWith(props.method, true);
    });

    it('submits payment form by calling submitForm callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('submitForm', () => {
                if (options.braintreelocalmethods?.submitForm) {
                    options.braintreelocalmethods.submitForm();
                }
            });

            return Promise.resolve(checkoutState);
        });

        const submitFormMock = jest.fn();
        const setSubmittedMock = jest.fn();
        const newProps = {
            ...props,

            paymentForm: {
                submitForm: submitFormMock,
                setSubmitted: setSubmittedMock,
            } as unknown as PaymentFormService,
        };

        render(<BraintreeLocalPaymentMethod {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('submitForm');

        expect(setSubmittedMock).toHaveBeenCalledWith(true);
        expect(submitFormMock).toHaveBeenCalled();
    });

    it('disables submit button and throws an error by calling onError callback', async () => {
        const errorMock = new Error();

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.braintreelocalmethods?.onError) {
                    options.braintreelocalmethods.onError(errorMock);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const disableSubmitMock = jest.fn();
        const onUnhandledErrorMock = jest.fn();
        const newProps = {
            ...props,

            paymentForm: {
                disableSubmit: disableSubmitMock,
            } as unknown as PaymentFormService,
            onUnhandledError: onUnhandledErrorMock,
        };

        render(<BraintreeLocalPaymentMethod {...newProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onError');

        expect(disableSubmitMock).toHaveBeenCalled();
        expect(onUnhandledErrorMock).toHaveBeenCalledWith(errorMock);
    });
});
