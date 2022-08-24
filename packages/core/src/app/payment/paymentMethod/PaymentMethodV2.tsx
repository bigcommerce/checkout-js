import { PaymentMethodProps as ResolvedPaymentMethodProps, PaymentFormValues, PaymentMethodResolveId } from '@bigcommerce/checkout/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { ComponentType } from 'react';

import { withCheckout, WithCheckoutProps } from '../../checkout';
import { connectFormik, WithFormikProps } from '../../common/form';
import { withLanguage, WithLanguageProps } from '../../locale';
import { withForm, WithFormProps } from '../../ui/form';
import createPaymentFormService from '../createPaymentFormService';
import resolvePaymentMethod from '../resolvePaymentMethod';
import { default as PaymentMethodComponent } from './PaymentMethod';
import withPayment, { WithPaymentProps } from '../withPayment';

export interface PaymentMethodProps {
    method: PaymentMethod;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    resolveComponent?(query: PaymentMethodResolveId): ComponentType<ResolvedPaymentMethodProps>;
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
    resolveComponent = resolvePaymentMethod,
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

    const ResolvedPaymentMethod = resolveComponent({
        id: method.id,
        gateway: method.gateway,
        type: method.type,
    });

    if (!ResolvedPaymentMethod) {
        console.log('%c method not resolved, using V1 fallback', 'color: red', method.id)
        return <PaymentMethodComponent
            isEmbedded={ isEmbedded }
            isUsingMultiShipping={ isUsingMultiShipping }
            method={ method }
            onUnhandledError={ onUnhandledError }
        />;
    }

    console.log('%c method resolved successfully', 'color: green', method.id,);

    return <ResolvedPaymentMethod
        checkoutService={ checkoutService }
        checkoutState={ checkoutState }
        language={ language }
        method={ method }
        onUnhandledError={ onUnhandledError }
        paymentForm={ createPaymentFormService(
            formikContext,
            formContext,
            paymentContext
        ) }
    />;
};

export default withCheckout(props => props)(
    withLanguage(
        withPayment(
            withForm(
                connectFormik(PaymentMethodContainer)
            )
        )
    )
) as ComponentType<PaymentMethodProps>;
