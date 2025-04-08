import React, { FunctionComponent } from 'react';

import {
    CreditCardPaymentMethodComponent,
    CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import { checkoutcomPaymentMethods, getCheckoutcomValidationSchemas } from './checkoutcomFieldsets';
import { checkoutcomPaymentMethodsArray } from './checkoutcomFieldsets/getCheckoutcomFieldsetValidationSchemas';

export interface CheckoutcomCustomPaymentMethodProps
    extends Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema'> {
    checkoutCustomMethod: string;
}

const isCheckoutcomPaymentMethod = (methodId: string): methodId is checkoutcomPaymentMethods => {
    return Object.values(checkoutcomPaymentMethodsArray).includes(methodId);
};
const CheckoutcomCustomPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    method,
    checkoutService,
    checkoutState,
    ...rest
}) => {
    const { getConfig } = checkoutState.data;
    const isIdealHostedPageExperimentOn =
        getConfig()?.checkoutSettings.features['PI-2979.checkoutcom_enable_ideal_hosted_page'];

    const checkoutCustomMethod = method.id;
    const CheckoutcomCustomFieldset =
        checkoutCustomMethod in checkoutcomCustomFormFields
            ? checkoutcomCustomFormFields[checkoutCustomMethod]
            : ccDocumentField;

    const billingAddress = checkoutState.data.getBillingAddress();

    if (
        !isCheckoutcomPaymentMethod(checkoutCustomMethod) ||
        (checkoutCustomMethod === 'ideal' && isIdealHostedPageExperimentOn)
    ) {
        return null;
    }

    return (
        <CreditCardPaymentMethodComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={checkoutService.initializePayment}
            language={language}
            method={method}
            {...rest}
            cardFieldset={<CheckoutcomCustomFieldset debtor={billingAddress!} method={method} />}
            cardValidationSchema={getCheckoutcomValidationSchemas({
                paymentMethod: checkoutCustomMethod,
                language,
            })}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    CheckoutcomCustomPaymentMethod,
    [
        { gateway: 'checkoutcom', id: 'ideal' },
        { gateway: 'checkoutcom', id: 'fawry' },
        { gateway: 'checkoutcom', id: 'oxxo' },
        { gateway: 'checkoutcom', id: 'boleto' },
        { gateway: 'checkoutcom', id: 'sepa' },
        { gateway: 'checkoutcom', id: 'qpay' },
        { gateway: 'checkoutcom', id: 'p24' },
    ],
);
