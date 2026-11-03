import { type FormikContextType } from 'formik';

import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { type FormContextType } from '@bigcommerce/checkout/ui';

import createPaymentFormService from './createPaymentFormService';
import { type PaymentContextProps } from './PaymentContext';

describe('createPaymentFormService', () => {
    const formikContext = {
        setFieldTouched: jest.fn(),
        setFieldValue: jest.fn(),
        submitForm: jest.fn(),
        validateForm: jest.fn(),
        values: { paymentProviderRadio: 'braintreepaypal', terms: true },
    } as unknown as FormikContextType<PaymentFormValues>;

    const formContext: FormContextType = {
        isSubmitted: false,
        setSubmitted: jest.fn(),
    };

    const paymentContext: PaymentContextProps = {
        disableSubmit: jest.fn(),
        ensureBillingAddressSaved: jest.fn().mockResolvedValue(false),
        hidePaymentSubmitButton: jest.fn(),
        setSubmit: jest.fn(),
        setValidationSchema: jest.fn(),
    };

    it('exposes billing address validation from payment context', async () => {
        const paymentForm = createPaymentFormService(formikContext, formContext, paymentContext);

        expect(await paymentForm.ensureBillingAddressSaved?.()).toBe(false);
        expect(paymentContext.ensureBillingAddressSaved).toHaveBeenCalled();
    });

    it('reads field values from formik context', () => {
        const paymentForm = createPaymentFormService(formikContext, formContext, paymentContext);

        expect(paymentForm.getFieldValue('terms')).toBe(true);
        expect(paymentForm.getFormValues()).toBe(formikContext.values);
    });
});
