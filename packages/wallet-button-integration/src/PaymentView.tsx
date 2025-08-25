import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type ReactNode } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { SignOutLink } from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface PaymentViewProps {
    accountMask?: string;
    cardName?: string;
    cardType?: string;
    expiryMonth?: string;
    expiryYear?: string;
    shouldShowEditButton?: boolean;
    editButtonClassName?: string;
    editButtonLabel?: ReactNode;
    buttonId: string;
    method: PaymentMethod;
    onSignOut: () => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({
    accountMask,
    cardName,
    cardType,
    expiryMonth,
    expiryYear,
    shouldShowEditButton,
    editButtonClassName,
    editButtonLabel,
    buttonId,
    method,
    onSignOut,
}) => {
    return (
        <>
            {!!cardName && (
                <p data-test="payment-method-wallet-card-name">
                    <strong>
                        <TranslatedString id="payment.credit_card_name_label" />:
                    </strong>{' '}
                    {cardName}
                </p>
            )}

            {!!accountMask && !!cardType && (
                <p data-test="payment-method-wallet-card-type">
                    <strong>{`${cardType}:`}</strong> {accountMask}
                </p>
            )}

            {!!expiryMonth && !!expiryYear && (
                <p data-test="payment-method-wallet-card-expiry">
                    <strong>
                        <TranslatedString id="payment.credit_card_expiration_date_label" />:
                    </strong>{' '}
                    {`${expiryMonth}/${expiryYear}`}
                </p>
            )}

            {!!shouldShowEditButton && (
                <p>
                    {
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a
                            className={editButtonClassName}
                            href="#"
                            id={buttonId}
                            onClick={preventDefault()}
                        >
                            {editButtonLabel || (
                                <TranslatedString id="remote.select_different_card_action" />
                            )}
                        </a>
                    }
                </p>
            )}

            <SignOutLink method={method} onSignOut={onSignOut} />
        </>
    );
};

export default PaymentView;
