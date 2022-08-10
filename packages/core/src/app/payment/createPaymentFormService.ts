import { PaymentFormService, PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { FormikContext } from 'formik';

import { FormContextType } from '../ui/form';

import { PaymentContextProps } from './PaymentContext';

export default function createPaymentFormService(
    formikContext: FormikContext<PaymentFormValues>,
    formContext: FormContextType,
    paymentContext: PaymentContextProps
): PaymentFormService {
    const {
        setFieldTouched,
        setFieldValue,
        submitForm,
        validateForm,
    } = formikContext;

    const {
        isSubmitted,
        setSubmitted,
    } = formContext;

    const {
        disableSubmit,
        setSubmit,
        setValidationSchema,
        hidePaymentSubmitButton,
    } = paymentContext;

    return {
        disableSubmit,
        hidePaymentSubmitButton,
        isSubmitted: () => isSubmitted,
        setFieldTouched,
        setFieldValue,
        setSubmit,
        setSubmitted,
        setValidationSchema,
        submitForm,
        validateForm,
    };
}
