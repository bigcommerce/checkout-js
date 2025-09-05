import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type ComponentType, lazy, Suspense } from 'react';

import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { PaymentFormProvider, type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { LazyContainer } from '@bigcommerce/checkout/ui';

import { withCheckout, type WithCheckoutProps } from '../../checkout';
import { connectFormik, type WithFormikProps } from '../../common/form';
import { withForm, type WithFormProps } from '../../ui/form';
import createPaymentFormService from '../createPaymentFormService';
import resolvePaymentMethod from '../resolvePaymentMethod';
import withPayment, { type WithPaymentProps } from '../withPayment';

const PaymentMethodV1 = lazy(() => import(/* webpackChunkName: "payment-method-v1" */'./PaymentMethod'));

export interface PaymentMethodProps {
    method: PaymentMethod;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    onUnhandledError(error: Error): void;
}

const PaymentMethodContainer: ComponentType<
    PaymentMethodProps &
        WithCheckoutProps &
        WithLanguageProps &
        WithPaymentProps &
        WithFormProps &
        WithFormikProps<PaymentFormValues>
> = ({
    formik: formikContext,
    checkoutService,
    checkoutState,
    disableSubmit,
    hidePaymentSubmitButton,
    isEmbedded,
    isSubmitted,
    isUsingMultiShipping,
    language,
    method,
    onUnhandledError,
    setSubmit,
    setSubmitted,
    setValidationSchema,
}) => {
    const formContext = {
        isSubmitted,
        setSubmitted,
    };

    const paymentContext = {
        disableSubmit,
        hidePaymentSubmitButton,
        setSubmit,
        setValidationSchema,
    };

    const ResolvedPaymentMethod = resolvePaymentMethod(
        {
            id: method.id,
            gateway: method.gateway,
            type: method.type,
        },
    );

    if (!ResolvedPaymentMethod) {
        return (
            <LazyContainer>
                <PaymentMethodV1
                    isEmbedded={isEmbedded}
                    isUsingMultiShipping={isUsingMultiShipping}
                    method={method}
                    onUnhandledError={onUnhandledError}
                />
            </LazyContainer>
        );
    }

    const paymentForm = createPaymentFormService(formikContext, formContext, paymentContext);

    return (
        <PaymentFormProvider paymentForm={paymentForm}>
            <Suspense>
                <ResolvedPaymentMethod
                    checkoutService={checkoutService}
                    checkoutState={checkoutState}
                    language={language}
                    method={method}
                    onUnhandledError={onUnhandledError}
                    paymentForm={paymentForm}
                />
            </Suspense>
        </PaymentFormProvider>
    );
};

export default withCheckout((props) => props)(
    withLanguage(withPayment(withForm(connectFormik(PaymentMethodContainer)))),
) as ComponentType<PaymentMethodProps>;
