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
    const {
        setFieldTouched,
        setFieldValue,
        submitForm,
        validateForm,
        values,
    } = formikContext;

    const { isSubmitted, setSubmitted } = formContext;

    const { disableSubmit, setSubmit, setValidationSchema, hidePaymentSubmitButton } =
        paymentContext;

    const getFieldValue = <T>(key: string): T | unknown => values[key];

    return {
        disableSubmit,
        getFieldValue,
        getFormValues: () => values,
        hidePaymentSubmitButton,
        isSubmitted: () => isSubmitted,
        setFieldTouched: setFieldTouched as PaymentFormService['setFieldTouched'],
        setFieldValue: setFieldValue as PaymentFormService['setFieldValue'],
        setSubmit,
        setSubmitted,
        setValidationSchema,
        submitForm,
        validateForm,
    };
}
