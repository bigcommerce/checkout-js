import { BillingAddress } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import {
    checkoutcomCustomPaymentMethods,
    checkoutcomPaymentMethods,
    getCheckoutcomValidationSchemas,
} from '../checkoutcomFieldsets';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export interface CheckoutcomCustomPaymentMethodProps
    extends Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema'> {
    checkoutCustomMethod: string;
}

interface WithCheckoutCheckoutcomCustomPaymentMethodProps {
    debtor: BillingAddress;
}

const CheckoutcomCustomPaymentMethod: FunctionComponent<
    CheckoutcomCustomPaymentMethodProps &
        WithCheckoutCheckoutcomCustomPaymentMethodProps &
        WithLanguageProps
> = ({ language, checkoutCustomMethod, ...rest }) => {
    const CheckoutcomCustomFieldset =
        checkoutCustomMethod in checkoutcomCustomFormFields
            ? checkoutcomCustomFormFields[checkoutCustomMethod as checkoutcomCustomPaymentMethods]
            : ccDocumentField;

    return (
        <CreditCardPaymentMethod
            {...rest}
            cardFieldset={<CheckoutcomCustomFieldset debtor={rest.debtor} method={rest.method} />}
            cardValidationSchema={getCheckoutcomValidationSchemas({
                paymentMethod: checkoutCustomMethod as checkoutcomPaymentMethods,
                language,
            })}
        />
    );
};

function mapToCheckoutcomCustomPaymentMethodProps({
    checkoutState,
}: CheckoutContextProps): WithCheckoutCheckoutcomCustomPaymentMethodProps {
    const {
        data: { getBillingAddress },
    } = checkoutState;
    const billingAddress = getBillingAddress();

    if (!billingAddress) {
        throw new Error('Billing address is missing');
    }

    return {
        debtor: billingAddress,
    };
}

export default withLanguage(
    withCheckout(mapToCheckoutcomCustomPaymentMethodProps)(CheckoutcomCustomPaymentMethod),
);
