import React from 'react';

import { configure, render, screen } from '@bigcommerce/checkout/test-utils';

import { CartSummaryItemImage } from './CartSummaryItemImage';
import { getDigitalItem, getGiftCertificateItem, getPhysicalItem } from './lineItem.mock';

configure({ testIdAttribute: 'data-test' });

describe('CartSummaryItemImage Component', () => {
    it('renders image of first physical item', () => {
        render(
            <CartSummaryItemImage
                lineItems={{
                    physicalItems: [getPhysicalItem()],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [],
                    customItems: [],
                }}
            />,
        );

        const image = screen.getByTestId('cart-item-image');

        expect(image).toHaveAttribute('src', getPhysicalItem().imageUrl);
        expect(image).toHaveAttribute('alt', getPhysicalItem().name);
    });

    it('falls back to first digital item when there are no physical items', () => {
        render(
            <CartSummaryItemImage
                lineItems={{
                    physicalItems: [],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [],
                    customItems: [],
                }}
            />,
        );

        expect(screen.getByTestId('cart-item-image')).toHaveAttribute(
            'src',
            getDigitalItem().imageUrl,
        );
    });

    it('renders gift certificate icon when cart only contains gift certificates', () => {
        render(
            <CartSummaryItemImage
                lineItems={{
                    physicalItems: [],
                    digitalItems: [],
                    giftCertificates: [getGiftCertificateItem()],
                    customItems: [],
                }}
            />,
        );

        expect(screen.queryByTestId('cart-item-image')).not.toBeInTheDocument();
        expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('falls back to the next item with an image when first physical item has none', () => {
        render(
            <CartSummaryItemImage
                lineItems={{
                    physicalItems: [{ ...getPhysicalItem(), imageUrl: '' }],
                    digitalItems: [getDigitalItem()],
                    giftCertificates: [],
                    customItems: [],
                }}
            />,
        );

        expect(screen.getByTestId('cart-item-image')).toHaveAttribute(
            'src',
            getDigitalItem().imageUrl,
        );
    });

    it('renders nothing when no item has an image and there are no gift certificates', () => {
        const { container } = render(
            <CartSummaryItemImage
                lineItems={{
                    physicalItems: [{ ...getPhysicalItem(), imageUrl: '' }],
                    digitalItems: [{ ...getDigitalItem(), imageUrl: '' }],
                    giftCertificates: [],
                    customItems: [],
                }}
            />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
