import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { withLanguage, WithLanguageProps } from '../../locale';
import { checkoutcomCustomPaymentMethods, checkoutcomPaymentMethods, getCheckoutcomValidationSchemas } from '../checkoutcomFieldsets';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export interface CheckoutcomCustomPaymentMethodProps
    extends Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema'> {
    checkoutCustomMethod: string;
    method: PaymentMethod;
}

const CheckoutcomCustomPaymentMethod: FunctionComponent<
    CheckoutcomCustomPaymentMethodProps & WithLanguageProps
> = ({ language, checkoutCustomMethod, method, ...rest }) => {

    const CheckoutcomCustomFieldset = checkoutCustomMethod in checkoutcomCustomFormFields
    ? checkoutcomCustomFormFields[checkoutCustomMethod as checkoutcomCustomPaymentMethods]
    : ccDocumentField;

    const checkoutcomBICCustomFieldset = (
        <TextFieldForm
            additionalClassName="form-field--ccDocument"
            autoComplete="cc-bic"
            labelId="payment.credit_card_bic_label"
            name="ccDocument"
        />
    );

    return (
        <CreditCardPaymentMethod
            { ...rest }
            cardFieldset={ <CheckoutcomCustomFieldset method={ rest.method } /> }
            cardValidationSchema={ getCheckoutcomValidationSchemas({
                paymentMethod: checkoutCustomMethod as checkoutcomPaymentMethods,
                language,
            }) }
            method={ method }
        />
    );
};

export default withLanguage(CheckoutcomCustomPaymentMethod);
