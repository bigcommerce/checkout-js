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
            expect(getOrderSummaryItemImage(lineLineItem)).toEqual(
                <img alt="" data-test="cart-item-image" src={lineLineItem.imageUrl} />
            );
        });
    });
});
