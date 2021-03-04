import React, { FunctionComponent } from 'react';

import { withLanguage, WithLanguageProps } from '../../locale';
import { checkoutcomCustomPaymentMethods, checkoutcomPaymentMethods, getCheckoutcomValidationSchemas } from '../checkoutcomFieldsets';

import checkoutcomCustomFormFields, { ccDocumentField } from './CheckoutcomCustomFormFields';
import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export interface CheckoutcomCustomPaymentMethodProps
    extends Omit<CreditCardPaymentMethodProps, 'cardFieldset' | 'cardValidationSchema'> {
    checkoutCustomMethod: string;
}

const CheckoutcomCustomPaymentMethod: FunctionComponent<
    CheckoutcomCustomPaymentMethodProps & WithLanguageProps
> = ({ language, checkoutCustomMethod, ...rest }) => {

    const CheckoutcomCustomFieldset = checkoutCustomMethod in checkoutcomCustomFormFields
    ? checkoutcomCustomFormFields[checkoutCustomMethod as checkoutcomCustomPaymentMethods]
    : ccDocumentField;

    return (
        <CreditCardPaymentMethod
            { ...rest }
            cardFieldset={ <CheckoutcomCustomFieldset method={ rest.method } /> }
            cardValidationSchema={ getCheckoutcomValidationSchemas({
                paymentMethod: checkoutCustomMethod as checkoutcomPaymentMethods,
                language,
            }) }
        />
    );
};

export default withLanguage(CheckoutcomCustomPaymentMethod);
