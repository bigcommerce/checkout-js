import { type CardInstrument } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { Button, ButtonSize, ButtonVariant, CreditCardIcon } from '@bigcommerce/checkout/ui';

import { type PayPalFastlaneCardComponentRef } from '../PayPalCommerceFastlanePaymentMethod';

import './PayPalCommerceFastlaneInstrumentsForm.scss';

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

interface PayPalCommerceFastlaneInstrumentsFormProps {
    selectedInstrument: CardInstrument;
    onChange: PayPalFastlaneCardComponentRef['showPayPalCardSelector'];
    handleSelectInstrument(instrument: CardInstrument): void;
}

const PayPalCommerceFastlaneInstrumentsForm: FunctionComponent<
    PayPalCommerceFastlaneInstrumentsFormProps
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
            className="paypal-commerce-fastlane-instrument"
            data-test="paypal-commerce-fastlane-instrument-form"
        >
            <div>
                <div className="paypal-commerce-fastlane-instrument-details">
                    <CreditCardIcon cardType={cardType} />

                    <div
                        className="instrumentSelect-card"
                        data-test="paypal-fastlane-instrument-last4"
                    >
                        {/* &#9679; is a ● */}
                        <span>&#9679;&#9679;&#9679;&#9679; {selectedInstrument.last4}</span>
                    </div>
                </div>
                <div className="paypal-commerce-fastlane-instrument-branding">
                    <PoweredByPayPalFastlaneLabel />
                </div>
            </div>

            <div className="paypal-commerce-fastlane-instrument-change-action">
                <Button
                    onClick={handleChange}
                    size={ButtonSize.Tiny}
                    testId="paypal-commerce-fastlane-instrument-change"
                    variant={ButtonVariant.Secondary}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default PayPalCommerceFastlaneInstrumentsForm;
