import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { expirationDate } from 'card-validator';
import classNames from 'classnames';
import creditCardType from 'credit-card-type';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CreditCardIcon, IconPayPalConnectSmall } from '@bigcommerce/checkout/ui';

import './BraintreeAcceleratedCheckoutInstrumentMenuItem.scss';

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

export interface BraintreeAcceleratedCheckoutInstrumentMenuItemProps {
    className?: string;
    instrument: CardInstrument;
    testId: string;
    onClick?(): void;
}

const BraintreeAcceleratedCheckoutInstrumentMenuItem: FunctionComponent<
    BraintreeAcceleratedCheckoutInstrumentMenuItemProps
> = ({ className, instrument, testId, onClick }) => {
    const cardType = mapFromInstrumentCardType(instrument.brand);
    const cardInfo = creditCardType.getTypeInfo(cardType);
    const isExpired = !expirationDate({
        month: instrument.expiryMonth,
        year: instrument.expiryYear,
    }).isValid;

    return (
        <button className={className} data-test={testId} onClick={onClick} type="button">
            <div
                className={classNames('instrumentSelect-details', {
                    'instrumentSelect-details--expired': isExpired,
                })}
            >
                <CreditCardIcon cardType={cardType} />

                <div className="instrumentSelect-card" data-test={`${testId ?? ''}-last4`}>
                    {cardInfo ? (
                        <TranslatedString
                            data={{
                                cardTitle: cardInfo.niceType ?? '',
                                endingIn: instrument.last4,
                            }}
                            id="payment.instrument_ending_in_text"
                        />
                    ) : (
                        <TranslatedString
                            data={{ endingIn: instrument.last4 }}
                            id="payment.instrument_default_ending_in_text"
                        />
                    )}
                </div>

                <div
                    className={classNames('instrumentSelect-expiry', {
                        'instrumentSelect-expiry--expired': isExpired,
                    })}
                    data-test={`${testId || ''}-expiry`}
                >
                    {isExpired ? (
                        <TranslatedString
                            data={{
                                expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}`,
                            }}
                            id="payment.instrument_expired_text"
                        />
                    ) : (
                        <TranslatedString
                            data={{
                                expiryDate: `${instrument.expiryMonth}/${instrument.expiryYear}`,
                            }}
                            id="payment.instrument_expires_text"
                        />
                    )}
                </div>

                <div className="instrument-powered-by-icon">
                    <IconPayPalConnectSmall />
                </div>
            </div>
        </button>
    );
};

export default BraintreeAcceleratedCheckoutInstrumentMenuItem;
