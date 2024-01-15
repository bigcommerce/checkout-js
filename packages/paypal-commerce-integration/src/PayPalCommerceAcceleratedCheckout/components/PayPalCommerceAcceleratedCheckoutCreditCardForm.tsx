import React, { FunctionComponent, useEffect } from 'react';

import { PayPalConnectCardComponentRef } from '../PayPalCommerceAcceleratedCheckoutPaymentMethod';

import './PayPalCommerceAcceleratedCheckoutCreditCardForm.scss';

interface PayPalCommerceAcceleratedCheckoutCreditCardFormProps {
    renderPayPalConnectCardComponent?: PayPalConnectCardComponentRef['render'];
}

const PayPalCommerceAcceleratedCheckoutCreditCardForm: FunctionComponent<
    PayPalCommerceAcceleratedCheckoutCreditCardFormProps
> = ({ renderPayPalConnectCardComponent }) => {
    useEffect(() => {
        if (typeof renderPayPalConnectCardComponent === 'function') {
            renderPayPalConnectCardComponent('#paypal-commerce-axo-cc-form-container');
        }
    }, [renderPayPalConnectCardComponent]);

    return (
        <div
            data-test="paypal-commerce-axo-cc-form-container"
            id="paypal-commerce-axo-cc-form-container"
            className="paypal-commerce-axo-cc-form-container"
        />
    );
};

export default PayPalCommerceAcceleratedCheckoutCreditCardForm;
