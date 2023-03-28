import React, { FunctionComponent, useCallback } from 'react';

import BraintreeAchPaymentForm, { BraintreeAchPaymentFormProps } from './BraintreeAchPaymentForm';

export type BraintreeAchPaymentMethodProps = Omit<
    BraintreeAchPaymentFormProps,
    'mandateText' | 'isLoadingBillingCountries' | 'usCountry' | 'initializeBillingAddressFields'
>;

const mandateText = 'I authorize Braintree to debit my bank account on behalf of My Online Store.';

const BraintreeAchPaymentMethod: FunctionComponent<BraintreeAchPaymentMethodProps> = ({ initializePayment, method, ...rest }) => {
    const initializeBraintreeAchPayment = useCallback((options) => initializePayment({
        braintreeach: {
            mandateText
        },
        ...options,
    }), [initializePayment]);

    return (
        <BraintreeAchPaymentForm
            initializePayment={initializeBraintreeAchPayment}
            mandateText={mandateText}
            method={method}
            {...rest}
        />
    )
}

export default BraintreeAchPaymentMethod;
