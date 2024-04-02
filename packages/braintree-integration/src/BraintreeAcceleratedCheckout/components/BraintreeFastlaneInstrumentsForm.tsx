import { CardInstrument } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent } from 'react';

import { Button, ButtonSize, ButtonVariant, CreditCardIcon } from '@bigcommerce/checkout/ui';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { BraintreeFastlaneComponentRef } from '../BraintreeAcceleratedCheckoutPaymentMethod';

import './BraintreeFastlaneInstrumentsForm.scss';

function mapFromInstrumentCardType(type: string): string {
    switch (type) {
        case 'amex':
        case 'american_express':
            return 'american-express';

        case 'diners':
            return 'diners-club';

        default:
            return type;
    }
}

interface BraintreeFastlaneInstrumentsFormProps {
    selectedInstrument: CardInstrument;
    onChange: BraintreeFastlaneComponentRef['showPayPalCardSelector'];
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
                    size={ButtonSize.Tiny}
                    testId="braintree-fastlane-instrument-change"
                    variant={ButtonVariant.Secondary}
                    onClick={handleChange}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default BraintreeFastlaneInstrumentsForm;
