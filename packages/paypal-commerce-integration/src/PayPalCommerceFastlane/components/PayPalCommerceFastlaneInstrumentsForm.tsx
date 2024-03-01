import { CardInstrument } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent } from 'react';

import { CreditCardIcon, Button, ButtonSize, ButtonVariant } from '@bigcommerce/checkout/ui';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { PayPalFastlaneCardComponentRef } from '../PayPalCommerceFastlanePaymentMethod';

import './PayPalCommerceFastlaneInstrumentsForm.scss';

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

interface PayPalCommerceFastlaneInstrumentsFormProps {
    onChange: PayPalFastlaneCardComponentRef['showPayPalCardSelector'];
    handleSelectInstrument(instrument: CardInstrument): void;
    selectedInstrument: CardInstrument;
}

const PayPalCommerceFastlaneInstrumentsForm: FunctionComponent<
    PayPalCommerceFastlaneInstrumentsFormProps
> = ({
    onChange,
    handleSelectInstrument,
    selectedInstrument,
}) => {
    const cardType = mapFromInstrumentCardType(selectedInstrument.brand).toLowerCase();

    const handleChange = async () => {
        if (typeof onChange === 'function') {
            const result = await onChange();

            if (result) {
                handleSelectInstrument(result);
            }
        }
    }

    return (
        <div
            className="paypal-commerce-fastlane-instrument"
            data-test="paypal-commerce-fastlane-instrument-form"
        >
            <div>
                <div className="paypal-commerce-fastlane-instrument-details">
                    <CreditCardIcon cardType={cardType} />

                    <div className="instrumentSelect-card" data-test="paypal-fastlane-instrument-last4">
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
                    size={ButtonSize.Tiny}
                    testId="paypal-commerce-fastlane-instrument-change"
                    variant={ButtonVariant.Secondary}
                    onClick={handleChange}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default PayPalCommerceFastlaneInstrumentsForm;
