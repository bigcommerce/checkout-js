import { type FormikContextType } from 'formik';

import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import createPaymentFormService from './createPaymentFormService';
import { type PaymentContextProps } from './PaymentContext';

describe('createPaymentFormService', () => {
    let formikContext: FormikContextType<PaymentFormValues>;
    let paymentContext: PaymentContextProps;

    const formContext = { isSubmitted: false, setSubmitted: jest.fn() };

    beforeEach(() => {
        formikContext = {
            setFieldTouched: jest.fn(),
            setFieldValue: jest.fn(),
            submitForm: jest.fn(),
            validateForm: jest.fn().mockResolvedValue({}),
            values: { paymentProviderRadio: 'paypalcommerce' },
        } as unknown as FormikContextType<PaymentFormValues>;

        paymentContext = {
            disableSubmit: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
        };
    });

    it('returns the payment form errors when there is no billing form', async () => {
        const service = createPaymentFormService(formikContext, formContext, paymentContext);

        await expect(service.validateForm()).resolves.toEqual({});
        expect(service.isBillingFormValid?.()).toBe(true);
    });

    it('returns the payment form errors when the billing form is valid', async () => {
        jest.spyOn(formikContext, 'validateForm').mockResolvedValue({ terms: 'required' });

        const service = createPaymentFormService(formikContext, formContext, {
            ...paymentContext,
            isBillingFormValid: () => true,
        });

        await expect(service.validateForm()).resolves.toEqual({ terms: 'required' });
    });

    it('adds a billing address error when the billing form is invalid', async () => {
        jest.spyOn(formikContext, 'validateForm').mockResolvedValue({ terms: 'required' });

        const service = createPaymentFormService(formikContext, formContext, {
            ...paymentContext,
            isBillingFormValid: () => false,
        });

        await expect(service.validateForm()).resolves.toEqual({
            terms: 'required',
            billingAddress: 'invalid',
        });
        expect(service.isBillingFormValid?.()).toBe(false);
    });
});
