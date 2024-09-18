import React, { FunctionComponent, useEffect } from 'react';

import { PayPalFastlaneCardComponentRef } from '../PayPalCommerceFastlanePaymentMethod';

import './PayPalCommerceFastlaneCreditCardForm.scss';

interface PayPalCommerceFastlaneCreditCardFormProps {
    renderPayPalCardComponent?: PayPalFastlaneCardComponentRef['renderPayPalCardComponent'];
}

const PayPalCommerceFastlaneCreditCardForm: FunctionComponent<
    PayPalCommerceFastlaneCreditCardFormProps
> = ({ renderPayPalCardComponent }) => {
    useEffect(() => {
        if (typeof renderPayPalCardComponent === 'function') {
            renderPayPalCardComponent('#paypal-commerce-fastlane-cc-form-container');
        }
    }, [renderPayPalCardComponent]);

    return (
        <div
            data-test="paypal-commerce-fastlane-cc-form-container"
            id="paypal-commerce-fastlane-cc-form-container"
            className="paypal-commerce-fastlane-cc-form-container"
        />
    );
};

export default PayPalCommerceFastlaneCreditCardForm;
