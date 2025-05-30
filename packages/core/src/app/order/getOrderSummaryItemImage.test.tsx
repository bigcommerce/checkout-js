import { createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { getPhysicalItem } from '../cart/lineItem.mock';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';

describe('getOrderSummaryItemImage()', () => {
    describe('when item has no image', () => {
        const lineLineItem = {
            ...getPhysicalItem(),
            imageUrl: '',
        };

        it('returns empty', () => {
            expect(getOrderSummaryItemImage(lineLineItem)).toBeFalsy();
        });
    });

    describe('when item has image', () => {
        const lineLineItem = getPhysicalItem();

        it('returns image', () => {
            // Create the same translated alt text that the component would create
            const language = createLanguageService();
            const expectedAltText = language.translate('cart.product_image_alt', { name: lineLineItem.name });

            expect(getOrderSummaryItemImage(lineLineItem)).toEqual(
                <img alt={expectedAltText} data-test="cart-item-image" src={lineLineItem.imageUrl} />
            );
        });
    });
});
