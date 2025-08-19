/* eslint-disable @typescript-eslint/naming-convention */
import { createCheckoutService, type LanguageService } from '@bigcommerce/checkout-sdk';
import { fireEvent, render, screen } from '@testing-library/react';
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

import { getPaypalCommerceRatePayMethodMock } from '../mocks/paymentMethods.mock';

import PaypalCommerceRatePayPaymentMethod from './PaypalCommerceRatePayPaymentMethod';

describe('PaypalCommerceRatePayPaymentMethod', () => {
    let eventEmitter: EventEmitter;
    let PaypalCommerceRatePayPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    let localeContext: LocaleContextType;
    let ratepayErrors: { [key: string]: string };
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getPaypalCommerceRatePayMethodMock(),
        checkoutService,
        checkoutState,

        paymentForm: {
            isSubmitted: jest.fn(),
            setSubmitted: jest.fn(),
            setValidationSchema: jest.fn(),
            setFieldValue: jest.fn(),
        } as unknown as PaymentFormService,

        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    } as unknown as PaymentMethodProps;

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

        PaypalCommerceRatePayPaymentMethodTest = (testProps: PaymentMethodProps) => (
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

                            if (!/^\d{7,11}$/.exec(values.ratepayPhoneNumber)) {
                                errors.ratepayPhoneNumber = 'Phone number is invalid';
                            }

                            if (!/^[0-9+][0-9+]{+,}$/.exec(values.ratepayPhoneCountryCode)) {
                                errors.ratepayPhoneCountryCode = 'Phone code is invalid';
                            }

                            ratepayErrors = errors;

                            return ratepayErrors;
                        }}
                    >
                        {({ handleSubmit }) => (
                            <PaymentFormContext.Provider value={{ paymentForm }}>
                                <form aria-label="form" onSubmit={handleSubmit}>
                                    <PaypalCommerceRatePayPaymentMethod {...testProps} />
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

        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommerceratepay: {
                container: '#checkout-payment-continue',
                legalTextContainer: 'legal-text-container',
                loadingContainerId: 'checkout-page-container',
                getFieldsValues: expect.any(Function),
                onError: expect.any(Function),
            },
        });
    });

    it('submits form', async () => {
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        const submitForm = jest.fn();
        // eslint-disable-next-line testing-library/no-node-access
        const form = document.querySelectorAll('form')[0];

        form.onsubmit = submitForm;

        fireEvent.submit(form);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(submitForm).toHaveBeenCalled();
    });

    it('deinitializes PaypalCommerceRatePayPaymentMethod', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const { unmount } = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('shows error when phone number validation failed', async () => {
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        const phoneNumberInput = screen.getByTestId('ratepayPhoneNumber-text');

        fireEvent.blur(phoneNumberInput);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(ratepayErrors.ratepayPhoneNumber).toEqual('Phone number is invalid');
    });

    it('shows error when phone code validation failed', async () => {
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        const phoneCountryCodeInput = screen.getByTestId('ratepayPhoneCountryCode-text');

        fireEvent.blur(phoneCountryCodeInput);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(ratepayErrors.ratepayPhoneCountryCode).toEqual('Phone code is invalid');
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during PaypalCommerceRatePayPaymentMethod deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const { unmount } = render(<PaypalCommerceRatePayPaymentMethodTest {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('calls ratepay digital error', async () => {
        const isSubmitted = jest.fn();
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
                if (options.paypalcommerceratepay?.onError) {
                    options.paypalcommerceratepay.onError(digitalErrorMock);
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
                isSubmitted,
            } as unknown as PaymentFormService,
            onUnhandledError: onUnhandledErrorMock,
        };

        render(<PaypalCommerceRatePayPaymentMethodTest {...newProps} />);
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
