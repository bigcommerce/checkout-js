import {
    AccountInstrument,
    createCheckoutService,
    HostedInstrument,
    LanguageService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { EventEmitter } from 'events';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';

import { getPayPalCommerceMethod } from '../mocks/paymentMethods.mock';

import PayPalCommercePaymentMethodComponent from './PayPalCommercePaymentMethodComponent';

describe('PayPalCommercePaymentMethodComponent', () => {
    let eventEmitter: EventEmitter;
    const paymentForm: PaymentFormService = getPaymentFormServiceMock();

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getPayPalCommerceMethod(),
        onUnhandledError: jest.fn(),
        paymentForm,
        onInitButton: jest.fn(),
        providerOptionsKey: 'paypalcommerce',
    };

    const untrustedAccountInstrument: AccountInstrument = {
        bigpayToken: '31415',
        provider: 'paypalcommerce',
        externalId: 'untrusted@external-id.com',
        trustedShippingAddress: false,
        defaultInstrument: false,
        method: 'paypal',
        type: 'account',
    };

    const trustedAccountInstrument: AccountInstrument = {
        bigpayToken: '31415',
        provider: 'paypalcommerce',
        externalId: 'trusted@external-id.com',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'paypal',
        type: 'account',
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        jest.spyOn(paymentForm, 'validateForm').mockResolvedValue({});

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
                onInit: expect.any(Function),
                submitForm: expect.any(Function),
                onRenderButton: expect.any(Function),
                onError: expect.any(Function),
                onValidate: expect.any(Function),
                onInitButton: expect.any(Function),
                getFieldsValues: expect.any(Function),
                shouldRenderPayPalButtonOnInitialization: false,
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
                onError: expect.any(Function),
                onValidate: expect.any(Function),
                submitForm: expect.any(Function),
                onRenderButton: expect.any(Function),
                onInitButton: expect.any(Function),
                getFieldsValues: expect.any(Function),
                shouldRenderPayPalButtonOnInitialization: false,
                onInit: expect.any(Function),
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

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onRenderButton');

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(props.method, true);
    });

    it('shows payment submit button if we have selected vaulted instrument', async () => {
        render(
            <PayPalCommercePaymentMethodComponent
                {...props}
                currentInstrument={trustedAccountInstrument}
                shouldConfirmInstrument={false}
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(props.method, false);
    });

    it('hides payment submit button if we have selected untrusted vaulted instrument', async () => {
        render(
            <PayPalCommercePaymentMethodComponent
                {...props}
                currentInstrument={untrustedAccountInstrument}
                shouldConfirmInstrument
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.hidePaymentSubmitButton).toHaveBeenCalledWith(props.method, true);
    });

    it('calls the getFieldsValues method with shouldSaveInstrument true if we need to confirm the selected instrument', async () => {
        let shouldSaveInstrument: boolean | undefined;

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            if (options.paypalcommerce?.getFieldsValues) {
                const formFields: HostedInstrument = options.paypalcommerce.getFieldsValues();

                shouldSaveInstrument = formFields.shouldSaveInstrument;
            }

            return Promise.resolve(checkoutState);
        });

        render(
            <PayPalCommercePaymentMethodComponent
                {...props}
                currentInstrument={untrustedAccountInstrument}
                shouldConfirmInstrument
            />,
        );

        await new Promise((resolve) => process.nextTick(resolve));

        expect(shouldSaveInstrument).toBeTruthy();
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

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('submitForm');

        expect(paymentForm.setSubmitted).toHaveBeenCalledWith(true);
        expect(paymentForm.submitForm).toHaveBeenCalled();
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

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        eventEmitter.emit('onError');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.disableSubmit).toHaveBeenCalled();
        expect(props.onUnhandledError).toHaveBeenCalledWith(errorMock);
    });

    it('throws specific error text when receive INSTRUMENT_DECLINED error message', async () => {
        const providerError = new Error('INSTRUMENT_DECLINED');
        const onUnhandledErrorMock = jest.fn();
        const newProps = {
            ...props,
            onUnhandledError: onUnhandledErrorMock,
        };

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.paypalcommerce?.onError) {
                    options.paypalcommerce.onError(providerError);
                }
            });

            return Promise.resolve(checkoutState);
        });

        render(<PayPalCommercePaymentMethodComponent {...newProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onError');

        expect(onUnhandledErrorMock).toHaveBeenCalledWith(
            new Error(props.language.translate('payment.errors.instrument_declined')),
        );
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

        const validationSuccess = jest.fn();

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        eventEmitter.emit('onValidate', validationSuccess, () => {});

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.validateForm).toHaveBeenCalled();
        expect(validationSuccess).toHaveBeenCalled();
    });

    it('is not passing form validation by calling onValidate callback', async () => {
        jest.spyOn(paymentForm, 'validateForm').mockResolvedValue({
            field1: 'validation error message',
            field2: 'validation error message',
        });

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onValidate', async (resolve, reject) => {
                if (options.paypalcommerce?.onError) {
                    await options.paypalcommerce.onValidate(resolve, reject);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const validationReject = jest.fn();

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        eventEmitter.emit('onValidate', () => {}, validationReject);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(paymentForm.validateForm).toHaveBeenCalled();
        expect(paymentForm.setSubmitted).toHaveBeenCalled();
        expect(paymentForm.setFieldTouched).toHaveBeenCalledTimes(2);
        expect(validationReject).toHaveBeenCalled();
    });

    it('passed form validation by calling onInitButton callback', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onInitButton', async (actions) => {
                if (options.paypalcommerce?.onError) {
                    await options.paypalcommerce.onInitButton(actions);
                }
            });

            return Promise.resolve(checkoutState);
        });

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        const buttonActionsMock = { disable: jest.fn(), enable: jest.fn() };

        eventEmitter.emit('onInitButton', buttonActionsMock);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(buttonActionsMock.enable).toHaveBeenCalled();
    });

    it('is not passing form validation by calling onInitButton callback', async () => {
        jest.spyOn(paymentForm, 'validateForm').mockResolvedValue({
            field1: 'validation error message',
        });

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onInitButton', async (actions) => {
                if (options.paypalcommerce?.onError) {
                    await options.paypalcommerce.onInitButton(actions);
                }
            });

            return Promise.resolve(checkoutState);
        });

        render(<PayPalCommercePaymentMethodComponent {...props} />);

        const buttonActionsMock = { disable: jest.fn(), enable: jest.fn() };

        eventEmitter.emit('onInitButton', buttonActionsMock);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(buttonActionsMock.disable).toHaveBeenCalled();
    });
});
