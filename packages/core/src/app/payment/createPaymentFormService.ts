import { FormikContextType } from 'formik';

import {
    PaymentFormService,
    PaymentFormValues,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContextType } from '@bigcommerce/checkout/ui';

import { PaymentContextProps } from './PaymentContext';

export default function createPaymentFormService(
    formikContext: FormikContextType<PaymentFormValues>,
    formContext: FormContextType,
    paymentContext: PaymentContextProps,
): PaymentFormService {
    const {
        setFieldTouched: formikSetFieldTouched,
        setFieldValue: formikSetFieldValue,
        submitForm,
        validateForm,
        values,
    } = formikContext;

    const setFieldTouched = formikSetFieldTouched as PaymentFormService['setFieldTouched'];
    const setFieldValue = formikSetFieldValue as PaymentFormService['setFieldValue'];

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
        setFieldTouched,
        setFieldValue,
        setSubmit,
        setSubmitted,
        setValidationSchema,
        submitForm,
        validateForm,
    };
}
