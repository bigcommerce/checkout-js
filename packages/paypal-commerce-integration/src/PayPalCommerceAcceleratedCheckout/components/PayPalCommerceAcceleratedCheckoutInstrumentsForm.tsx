import { CardInstrument } from '@bigcommerce/checkout-sdk';

import React, { FunctionComponent } from 'react';

import { CreditCardIcon, Button, ButtonSize, ButtonVariant } from '@bigcommerce/checkout/ui';
import { PoweredByPaypalConnectLabel } from '@bigcommerce/checkout/paypal-connect-integration';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { PayPalConnectCardComponentRef } from '../PayPalCommerceAcceleratedCheckoutPaymentMethod';

import './PayPalCommerceAcceleratedCheckoutInstrumentsForm.scss';

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

interface PayPalCommerceAcceleratedCheckoutInstrumentsFormProps {
    onChange: PayPalConnectCardComponentRef['showPayPalConnectCardSelector'];
    handleSelectInstrument(instrument: CardInstrument): void;
    selectedInstrument: CardInstrument;
}

const PayPalCommerceAcceleratedCheckoutInstrumentsForm: FunctionComponent<
    PayPalCommerceAcceleratedCheckoutInstrumentsFormProps
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
            className="paypal-commerce-axo-instrument"
            data-test="paypal-commerce-axo-instrument-form"
        >
            <div>
                <div className="paypal-commerce-axo-instrument-details">
                    <CreditCardIcon cardType={cardType} />

                    <div className="instrumentSelect-card" data-test="paypal-connect-instrument-last4">
                        {/* &#9679; is a ● */}
                        <span>&#9679;&#9679;&#9679;&#9679; {selectedInstrument.last4}</span>
                    </div>
                </div>
                <div className="paypal-commerce-axo-instrument-branding">
                    <PoweredByPaypalConnectLabel />
                </div>
            </div>

            <div className="paypal-commerce-axo-instrument-change-action">
                <Button
                    size={ButtonSize.Tiny}
                    testId="paypal-commerce-connect-instrument-change"
                    variant={ButtonVariant.Secondary}
                    onClick={handleChange}
                >
                    <TranslatedString id="common.change_action" />
                </Button>
            </div>
        </div>
    );
};

export default PayPalCommerceAcceleratedCheckoutInstrumentsForm;
