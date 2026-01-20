import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import {
    createCheckoutComAPMPaymentStrategy,
    createCheckoutComCreditCardPaymentStrategy,
    createCheckoutComFawryPaymentStrategy,
    createCheckoutComIdealPaymentStrategy,
    createCheckoutComSepaPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/checkoutcom-custom';
import React, { type FunctionComponent, useCallback } from 'react';

import {
    CreditCardPaymentMethodComponent,
    type CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import {
    type checkoutcomPaymentMethods,
    getCheckoutcomValidationSchemas,
} from './checkoutcomFieldsets';
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
    const checkoutCustomMethod = method.id;
    const CheckoutcomCustomFieldset =
        checkoutCustomMethod in checkoutcomCustomFormFields
            ? checkoutcomCustomFormFields[checkoutCustomMethod]
            : ccDocumentField;

    const billingAddress = checkoutState.data.getBillingAddress();

    const initializeCheckoutcomCustomPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [
                    createCheckoutComAPMPaymentStrategy,
                    createCheckoutComCreditCardPaymentStrategy,
                    createCheckoutComFawryPaymentStrategy,
                    createCheckoutComIdealPaymentStrategy,
                    createCheckoutComSepaPaymentStrategy,
                ],
            });
        },
        [checkoutService],
    );

    if (!isCheckoutcomPaymentMethod(checkoutCustomMethod)) {
        return null;
    }

    return (
        <CreditCardPaymentMethodComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeCheckoutcomCustomPayment}
            language={language}
            method={method}
            {...rest}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    [{ gateway: 'checkoutcom' }],
);
