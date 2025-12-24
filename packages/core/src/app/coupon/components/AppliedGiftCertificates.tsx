import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { ShopperCurrency } from '../../currency';

export interface AppliedGiftCertificateInfo {
    code: string;
    amount: number;
}

export const AppliedGiftCertificates: FunctionComponent<{giftCertificates: AppliedGiftCertificateInfo[]}> = ({ giftCertificates }) => {
    return giftCertificates.map((giftCertificate) => (
        <div
            data-test="cart-gift-certificate"
            key={giftCertificate.code}
        >
            <div
                aria-live="polite"
                className="cart-priceItem optimizedCheckout-contentPrimary"
            >
                <span className="cart-priceItem-label">
                    <TranslatedString id="redeemable.gift_certificate_text" />
                    <span className="gift-certificate-code"> ({giftCertificate.code})</span>
                </span>
                <span className="cart-priceItem-value" data-test="cart-price-value">
                    -<ShopperCurrency amount={giftCertificate.amount} />
                </span>
            </div>
        </div>
    ));
};
