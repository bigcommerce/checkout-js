import React, { type FunctionComponent, useEffect } from 'react';

import { type BigCommercePaymentsFastlaneCardComponentRef } from '../BigCommercePaymentsFastlanePaymentMethod';

import './BigCommercePaymentsFastlaneCreditCardForm.scss';

interface BigCommercePaymentsFastlaneCreditCardFormProps {
    renderPayPalCardComponent?: BigCommercePaymentsFastlaneCardComponentRef['renderPayPalCardComponent'];
}

const BigCommercePaymentsFastlaneCreditCardForm: FunctionComponent<
    BigCommercePaymentsFastlaneCreditCardFormProps
> = ({ renderPayPalCardComponent }) => {
    useEffect(() => {
        if (typeof renderPayPalCardComponent === 'function') {
            renderPayPalCardComponent('#big-commerce-payments-fastlane-cc-form-container');
        }
    }, [renderPayPalCardComponent]);

    return (
        <div
            className="big-commerce-payments-fastlane-cc-form-container"
            data-test="big-commerce-payments-fastlane-cc-form-container"
            id="big-commerce-payments-fastlane-cc-form-container"
        />
    );
};

export default BigCommercePaymentsFastlaneCreditCardForm;
