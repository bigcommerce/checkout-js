import React, { type FunctionComponent, useEffect } from 'react';

import { type BraintreeFastlaneComponentRef } from '../BraintreeFastlanePaymentMethod';

import './BraintreeFastlaneCreditCardForm.scss';

interface BraintreeFastlaneCreditCardFormProps {
    renderPayPalCardComponent?: BraintreeFastlaneComponentRef['renderPayPalCardComponent'];
}

const BraintreeFastlaneCreditCardForm: FunctionComponent<BraintreeFastlaneCreditCardFormProps> = ({
    renderPayPalCardComponent,
}) => {
    useEffect(() => {
        if (typeof renderPayPalCardComponent === 'function') {
            renderPayPalCardComponent('#braintree-fastlane-cc-form-container');
        }
    }, [renderPayPalCardComponent]);

    return (
        <div
            className="braintree-fastlane-cc-form-container"
            data-test="braintree-fastlane-cc-form-container"
            id="braintree-fastlane-cc-form-container"
        />
    );
};

export default BraintreeFastlaneCreditCardForm;
