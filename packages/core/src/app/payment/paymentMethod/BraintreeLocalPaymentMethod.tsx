import React, { FunctionComponent, useCallback, useContext } from 'react';

import { connectFormik } from '../../common/form';
import { FormContext } from '../../ui/form';
import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';
import { withLanguage } from "@bigcommerce/checkout/locale";


const BraintreeLocalPaymentMethod: FunctionComponent<any> = ({
     initializePayment,
     onUnhandledError,
     formik: { submitForm, setFieldTouched },
     uniqueId,
     language,
     ...rest
 }) => {
    const paymentContext = useContext(PaymentContext);
    const paymentUniqueId = `${uniqueId}-paymentWidget`;
    const { setSubmitted } = useContext(FormContext);
    const methodId = rest.method.id;

    const initializeBraintreeLocalMethodsPayment = useCallback(
        (options) =>
            initializePayment({
                ...options,
                braintreelocalmethods: {
                    container: '#checkout-payment-continue',
                    buttonText: language.translate('payment.continue_with_brand', { brandName: methodId }),
                    classNames: 'button button--action button--large button--slab optimizedCheckout-buttonPrimary',
                    onRenderButton: () => {
                        paymentContext?.hidePaymentSubmitButton(rest.method, true);
                    },
                    submitForm: () => {
                        setSubmitted(true);
                        submitForm();
                    },
                    onError: (error: Error) => {
                        onUnhandledError?.(error);
                    },
                },
            }),
        [
            initializePayment,
            submitForm,
            paymentContext,
            rest.method,
            setSubmitted,
            language,
            setFieldTouched,
            onUnhandledError,
        ],
    );

    const onError = (error: Error) => {
        paymentContext?.disableSubmit(rest.method, true);

        onUnhandledError?.(error);
    };

    return (
        <HostedWidgetPaymentMethod
            {...rest}
            containerId={paymentUniqueId}
            initializePayment={initializeBraintreeLocalMethodsPayment}
            onUnhandledError={onError}
            shouldShow={false}
        />
    );
};

export default withLanguage(connectFormik(BraintreeLocalPaymentMethod));
