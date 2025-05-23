import { CardInstrument } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent } from 'react';

import { CreditCardIcon, Button, ButtonSize, ButtonVariant } from '@bigcommerce/checkout/ui';
import { PoweredByPayPalFastlaneLabel } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { BigCommercePaymentsFastlaneCardComponentRef } from '../BigCommercePaymentsFastlanePaymentMethod';

import './BigCommercePaymentsFastlaneInstrumentsForm.scss';

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

interface BigCommercePaymentsFastlaneInstrumentsFormProps {
    onChange: BigCommercePaymentsFastlaneCardComponentRef['showPayPalCardSelector'];
    handleSelectInstrument(instrument: CardInstrument): void;
    selectedInstrument: CardInstrument;
}

const BigCommercePaymentsFastlaneInstrumentsForm: FunctionComponent<
    BigCommercePaymentsFastlaneInstrumentsFormProps
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
            className="big-commerce-payments-fastlane-instrument"
            data-test="big-commerce-payments-fastlane-instrument-form"
        >
            <div>
                <div className="big-commerce-payments-fastlane-instrument-details">
                    <CreditCardIcon cardType={cardType} />

                    <div className="instrumentSelect-card" data-test="big-commerce-fastlane-instrument-last4">
                        {/* &#9679; is a ● */}
                        <span>&#9679;&#9679;&#9679;&#9679; {selectedInstrument.last4}</span>
                    </div>
                </div>
                <div className="big-commerce-payments-fastlane-instrument-branding">
                    <PoweredByPayPalFastlaneLabel />
                </div>
            </div>

            <div className="big-commerce-payments-fastlane-instrument-change-action">
                <Button
                    size={ButtonSize.Tiny}
                    testId="big-commerce-payments-fastlane-instrument-change"
                    variant={ButtonVariant.Secondary}
                    onClick={handleChange}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default BigCommercePaymentsFastlaneInstrumentsForm;
