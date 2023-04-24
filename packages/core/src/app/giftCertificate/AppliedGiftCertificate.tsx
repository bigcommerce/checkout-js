import { GiftCertificate } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { ShopperCurrency } from '../currency';

export interface AppliedGiftCertificateProps {
    giftCertificate: GiftCertificate;
}

const AppliedGiftCertificate: FunctionComponent<AppliedGiftCertificateProps> = ({
    giftCertificate,
}) => (
    <div className="redeemable-column redeemable-info" data-test="redeemable-item--giftCertificate">
        <span className="redeemable-info-header">
            <span className="redeemable-info-header--highlight" data-test="giftCertificate-amount">
                <ShopperCurrency amount={giftCertificate.used} />
            </span>{' '}
            <TranslatedString id="redeemable.gift_certificate_text" />
        </span>

        <span className="redeemable-info-subHeader">
            {giftCertificate.remaining > 0 && (
                <span className="redeemable-info-subHeader--remaining">
                    <TranslatedString id="redeemable.gift_certificate_remaining_text" />{' '}
                    <span data-test="giftCertificate-remaining">
                        <ShopperCurrency amount={giftCertificate.remaining} />
                    </span>
                </span>
            )}

            <span data-test="giftCertificate-code">{giftCertificate.code}</span>
        </span>
    </div>
);

export default memo(AppliedGiftCertificate);
