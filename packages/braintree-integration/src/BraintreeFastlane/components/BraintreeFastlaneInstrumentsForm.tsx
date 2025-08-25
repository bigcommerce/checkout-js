import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { Button, ButtonSize, ButtonVariant, CreditCardIcon } from '@bigcommerce/checkout/ui';

import { type BraintreeFastlaneComponentRef } from '../BraintreeFastlanePaymentMethod';

import './BraintreeFastlaneInstrumentsForm.scss';

function mapFromInstrumentCardType(type: string): string {
    switch (type.toLowerCase()) {
        case 'amex':
        case 'american_express':
            return 'american-express';

        case 'diners':
            return 'diners-club';

        case 'master_card':
            return 'mastercard';

        default:
            return type;
    }
}

interface BraintreeFastlaneInstrumentsFormProps {
    onChange: BraintreeFastlaneComponentRef['showPayPalCardSelector'];
    selectedInstrument: CardInstrument;
    handleSelectInstrument(instrument: CardInstrument): void;
}

const BraintreeFastlaneInstrumentsForm: FunctionComponent<
    BraintreeFastlaneInstrumentsFormProps
> = ({ onChange, handleSelectInstrument, selectedInstrument }) => {
    const cardType = mapFromInstrumentCardType(selectedInstrument.brand).toLowerCase();

    const handleChange = async () => {
        if (typeof onChange === 'function') {
            const result = await onChange();

            if (result) {
                handleSelectInstrument(result);
            }
        }
    };

    return (
        <div
            className="braintree-fastlane-instrument"
            data-test="braintree-fastlane-instrument-form"
        >
            <div>
                <div className="braintree-fastlane-instrument-details">
                    <CreditCardIcon cardType={cardType} />

                    <div
                        className="instrumentSelect-card"
                        data-test="braintree-fastlane-instrument-last4"
                    >
                        {/* &#9679; is a ● */}
                        <span>&#9679;&#9679;&#9679;&#9679; {selectedInstrument.last4}</span>
                    </div>
                </div>
                <div className="braintree-fastlane-instrument-branding">
                    <PoweredByPayPalFastlaneLabel />
                </div>
            </div>

            <div className="braintree-fastlane-instrument-change-action">
                <Button
                    onClick={handleChange}
                    size={ButtonSize.Tiny}
                    testId="braintree-fastlane-instrument-change"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default BraintreeFastlaneInstrumentsForm;
