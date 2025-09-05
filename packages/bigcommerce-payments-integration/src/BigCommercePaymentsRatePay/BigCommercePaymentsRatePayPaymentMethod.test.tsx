import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsRatePayPayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import { fireEvent, render, screen, configure } from '@testing-library/react';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    PaymentFormContext,
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout as getCheckoutMock,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { act } from '@bigcommerce/checkout/test-utils';
import { FormContext } from '@bigcommerce/checkout/ui';

import { getBigCommercePaymentsRatePayMethodMock } from '../mocks/bigCommercePaymentsRatePayMocks';

import BigCommercePaymentsRatePayPaymentMethod from './BigCommercePaymentsRatePayPaymentMethod';

configure({
    testIdAttribute: 'data-test',
});

describe('BigCommercePaymentsRatePayPaymentMethod', () => {
    let eventEmitter: EventEmitter;
    let BigCommercePaymentsRatePayPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    let localeContext: LocaleContextType;
    let ratepayErrors: { [key: string]: string };
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getBigCommercePaymentsRatePayMethodMock(),
        checkoutService,
        checkoutState,

        paymentForm: {
            setSubmitted: jest.fn(),
            setValidationSchema: jest.fn(),
            setFieldValue: jest.fn(),
        } as unknown as PaymentFormService,

        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    const billingAddress = {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        shouldSaveAddress: true,
        phone: '555-555-5555',
        customFields: [],
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckoutMock());
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        localeContext = createLocaleContext(getStoreConfig());
        eventEmitter = new EventEmitter();
        paymentForm = getPaymentFormServiceMock();

        const submit = jest.fn();
        const initialValues = {
            ratepayBirthDate: new Date(),
            ratepayPhoneCountryCode: 'ss',
            ratepayPhoneNumber: '123',
        };

        BigCommercePaymentsRatePayPaymentMethodTest = (testProps: PaymentMethodProps) => (
            <LocaleContext.Provider value={localeContext}>
                <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                    <Formik
                        initialValues={initialValues}
                        onSubmit={submit}
                        validate={(values) => {
                            const errors = {
                                ratepayPhoneNumber: '',
                                ratepayPhoneCountryCode: '',
                            };

                            if (!values.ratepayPhoneNumber.match(/^\d{7,11}$/)) {
                                errors.ratepayPhoneNumber = 'Phone number is invalid';
                            }

                            if (!values.ratepayPhoneCountryCode.match(/^[0-9+][0-9+]{+,}$/)) {
                                errors.ratepayPhoneCountryCode = 'Phone code is invalid';
                            }

                            ratepayErrors = errors;

                            return ratepayErrors;
                        }}
                    >
                        {({ handleSubmit }) => (
                            <PaymentFormContext.Provider value={{ paymentForm }}>
                                <form aria-label="form" onSubmit={handleSubmit}>
                                    <BigCommercePaymentsRatePayPaymentMethod {...testProps} />
                                </form>
                            </PaymentFormContext.Provider>
                        )}
                    </Formik>
                </FormContext.Provider>
            </LocaleContext.Provider>
        );
    });

    it('successfully initializes payment with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            integrations: [createBigCommercePaymentsRatePayPayPaymentStrategy],
            bigcommerce_payments_ratepay: {
                container: '#checkout-payment-continue',
                legalTextContainer: 'legal-text-container',
                loadingContainerId: 'checkout-page-container',

                getFieldsValues: expect.any(Function),

                onError: expect.any(Function),
            },
        });
    });

    it('submits form', async () => {
        render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        const submitForm = jest.fn();
        // eslint-disable-next-line testing-library/no-node-access
        const form = document.querySelectorAll('form')[0];

        form.onsubmit = submitForm;

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submitForm).toHaveBeenCalled();
    });

    it('deinitializes BigCommercePaymentsRatePayPaymentMethod', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const component = render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('shows error when phone number validation failed', async () => {
        render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        const phoneNumberInput = screen.getByTestId('ratepayPhoneNumber-text');

        fireEvent.blur(phoneNumberInput);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(ratepayErrors.ratepayPhoneNumber).toEqual('Phone number is invalid');
    });

    it('shows error when phone code validation failed', async () => {
        render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        const phoneCountryCodeInput = screen.getByTestId('ratepayPhoneCountryCode-text');

        fireEvent.blur(phoneCountryCodeInput);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(ratepayErrors.ratepayPhoneCountryCode).toEqual('Phone code is invalid');
    });

    it('catches error during BigCommercePaymentsRatePayPaymentMethod initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during BigCommercePaymentsRatePayPaymentMethod deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        // eslint-disable-next-line testing-library/render-result-naming-convention
        const component = render(<BigCommercePaymentsRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('calls ratepay digital error', async () => {
        const onUnhandledErrorMock = jest.fn();
        const disableSubmitMock = jest.fn();
        const setSubmittedMock = jest.fn();
        const setValidationSchema = jest.fn();
        const setFieldValue = jest.fn();
        const digitalErrorMock = {
            status: 'error',

            three_ds_result: {
                acs_url: null,
                payer_auth_request: null,
                merchant_data: null,
                callback_url: null,
            },
            errors: [
                {
                    code: 'invalid_request_error',
                    message: 'We are experiencing difficulty processing your transaction',
                },
                {
                    code: 'transaction_declined',
                    message: 'Your transaction was declined. Please try again',
                    provider_error: {
                        code: 'ITEM_CATEGORY_NOT_SUPPORTED_BY_PAYMENT_SOURCE',
                    },
                },
            ],
        };

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation((options) => {
            eventEmitter.on('onError', () => {
                if (options.bigcommerce_payments_ratepay?.onError) {
                    options.bigcommerce_payments_ratepay.onError(digitalErrorMock);
                }
            });

            return Promise.resolve(checkoutState);
        });

        const newProps = {
            ...props,
            paymentForm: {
                disableSubmit: disableSubmitMock,
                setSubmitted: setSubmittedMock,
                setValidationSchema,
                setFieldValue,
            } as unknown as PaymentFormService,
            onUnhandledError: onUnhandledErrorMock,
        };

        render(<BigCommercePaymentsRatePayPaymentMethodTest {...newProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        eventEmitter.emit('onError');

        expect(onUnhandledErrorMock).toHaveBeenCalledWith(
            new Error(
                props.language.translate(
                    'payment.ratepay.errors.itemCategoryNotSupportedByPaymentSource',
                ),
            ),
        );
    });
});
