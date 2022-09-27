import { GiftCertificateItem } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { IconGiftCertificate } from '../ui/icon';

import { OrderSummaryItemProps } from './OrderSummaryItem';

function mapFromGiftCertificate(item: GiftCertificateItem): OrderSummaryItemProps {
    return {
        id: item.id,
        quantity: 1,
        amount: item.amount,
        name: item.name,
        image: (
            <span className="productImage-giftCertificate" data-test="cart-item-gift-certificate">
                <IconGiftCertificate />
            </span>
        ),
    };
}

export default mapFromGiftCertificate;
