import React, { FunctionComponent, useEffect } from 'react';

import { PayPalConnectComponentRef } from '../BraintreeAcceleratedCheckoutPaymentMethod';

import './BraintreeAcceleratedCheckoutCreditCardForm.scss';

interface BraintreeAcceleratedCheckoutCreditCardFormProps {
    renderPayPalConnectComponent?: PayPalConnectComponentRef['render'];
}

const BraintreeAcceleratedCheckoutCreditCardForm: FunctionComponent<
    BraintreeAcceleratedCheckoutCreditCardFormProps
> = ({ renderPayPalConnectComponent }) => {
    useEffect(() => {
        if (typeof renderPayPalConnectComponent === 'function') {
            renderPayPalConnectComponent('#braintree-axo-cc-form-container');
        }
    }, [renderPayPalConnectComponent]);

    return (
        <div
            data-test="braintree-axo-cc-form-container"
            id="braintree-axo-cc-form-container"
            className="braintree-axo-cc-form-container"
        />
    );
};

export default BraintreeAcceleratedCheckoutCreditCardForm;
