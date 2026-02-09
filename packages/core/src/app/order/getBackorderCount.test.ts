import {
    type DigitalItem,
    type PhysicalItem,
    type StockPosition,
} from '@bigcommerce/checkout-sdk';

import { getDigitalItem, getPhysicalItem } from '../cart/lineItem.mock';

import getBackorderCount from './getBackorderCount';

function getStockPosition(quantityBackordered: number): StockPosition {
    return {
        quantityOnHand: 10,
        quantityBackordered,
        quantityOutOfStock: 0,
        backorderMessage: null,
    };
}

describe('getBackorderCount()', () => {
    describe('when there are no items', () => {
        it('returns zero', () => {
            const items = {
                physicalItems: [] as PhysicalItem[],
                digitalItems: [] as DigitalItem[],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(0);
        });
    });

    describe('when items have no stockPosition', () => {
        it('returns zero', () => {
            const items = {
                physicalItems: [getPhysicalItem()],
                digitalItems: [getDigitalItem()],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(0);
        });
    });

    describe('when items have stockPosition with quantityBackordered as zero', () => {
        it('returns zero', () => {
            const items = {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        stockPosition: getStockPosition(0),
                    },
                ],
                digitalItems: [
                    {
                        ...getDigitalItem(),
                        stockPosition: getStockPosition(0),
                    },
                ],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(0);
        });
    });

    describe('when physical items have backorder quantities', () => {
        it('returns the sum of backorder quantities', () => {
            const items = {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        stockPosition: getStockPosition(3),
                    },
                    {
                        ...getPhysicalItem(),
                        id: '667',
                        stockPosition: getStockPosition(2),
                    },
                ],
                digitalItems: [] as DigitalItem[],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(5);
        });
    });

    describe('when digital items have backorder quantities', () => {
        it('returns the sum of backorder quantities', () => {
            const items = {
                physicalItems: [] as PhysicalItem[],
                digitalItems: [
                    {
                        ...getDigitalItem(),
                        stockPosition: getStockPosition(4),
                    },
                ],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(4);
        });
    });

    describe('when both physical and digital items have backorder quantities', () => {
        it('returns the combined sum of all backorder quantities', () => {
            const items = {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        stockPosition: getStockPosition(3),
                    },
                ],
                digitalItems: [
                    {
                        ...getDigitalItem(),
                        stockPosition: getStockPosition(2),
                    },
                ],
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(5);
        });
    });

    describe('when some items have stockPosition and some do not', () => {
        it('returns the sum of only the items with backorder quantities', () => {
            const items = {
                physicalItems: [
                    {
                        ...getPhysicalItem(),
                        stockPosition: getStockPosition(7),
                    },
                    getPhysicalItem(), // no stockPosition
                ],
                digitalItems: [getDigitalItem()], // no stockPosition
                giftCertificates: [],
                customItems: [],
            };

            expect(getBackorderCount(items)).toBe(7);
        });
    });
});
