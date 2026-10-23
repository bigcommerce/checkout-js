import { type FormikContextType } from 'formik';

import {
    type PaymentFormService,
    type PaymentFormValues,
} from '@bigcommerce/checkout/payment-integration-api';
import { type FormContextType } from '@bigcommerce/checkout/ui';

import { type PaymentContextProps } from './PaymentContext';

export default function createPaymentFormService(
    formikContext: FormikContextType<PaymentFormValues>,
    formContext: FormContextType,
    paymentContext: PaymentContextProps,
): PaymentFormService {
    const { setFieldTouched, setFieldValue, submitForm, validateForm, values } = formikContext;

    const { isSubmitted, setSubmitted } = formContext;

    const {
        disableSubmit,
        setSubmit,
        setValidationSchema,
        hidePaymentSubmitButton,
        isBillingFormValid = () => true,
    } = paymentContext;

    const getFieldValue = <T>(key: string): T | unknown => values[key];

    // The enhancedThemeV1 billing form is its own Formik form, so fold its validity
    // in here: methods that render their own button (e.g. PayPal) only ask this.
    const validatePaymentForm: PaymentFormService['validateForm'] = async (formValues) => {
        const errors = await validateForm(formValues);

        return isBillingFormValid() ? errors : { ...errors, billingAddress: 'invalid' };
    };

    return {
        disableSubmit,
        getFieldValue,
        getFormValues: () => values,
        hidePaymentSubmitButton,
        isBillingFormValid,
        isSubmitted: () => isSubmitted,
        setFieldTouched: setFieldTouched as PaymentFormService['setFieldTouched'],
        setFieldValue: setFieldValue as PaymentFormService['setFieldValue'],
        setSubmit,
        setSubmitted,
        setValidationSchema,
        submitForm,
        validateForm: validatePaymentForm,
    };
}
