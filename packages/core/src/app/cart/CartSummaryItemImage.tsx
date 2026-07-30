import { type LineItemMap } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { IconGiftCertificate } from '@bigcommerce/checkout/ui';

interface CartSummaryItemImageProps {
    lineItems: LineItemMap;
}

export const CartSummaryItemImage: FunctionComponent<CartSummaryItemImageProps> = ({
    lineItems,
}) => {
    const productWithImage = lineItems.physicalItems[0] || lineItems.digitalItems[0];

    if (productWithImage && productWithImage.imageUrl) {
        return (
            <img
                alt={productWithImage.name}
                data-test="cart-item-image"
                src={productWithImage.imageUrl}
            />
        );
    }

    if (lineItems.giftCertificates.length) {
        return <IconGiftCertificate />;
    }

    return null;
};
