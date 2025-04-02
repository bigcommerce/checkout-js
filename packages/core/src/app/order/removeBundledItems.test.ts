import {
    CustomItem,
    DigitalItem,
    GiftCertificateItem,
    PhysicalItem,
} from '@bigcommerce/checkout-sdk';

import { getPhysicalItem } from '../cart/lineItem.mock';

import removeBundledItems from './removeBundledItems';

describe('removeBundledItems()', () => {
    describe('when there are no items', () => {
        const items = {
            physicalItems: [] as PhysicalItem[],
            digitalItems: [] as DigitalItem[],
            giftCertificates: [] as GiftCertificateItem[],
            // for now, force it to be null this way.
            customItems: null as unknown as CustomItem[],
        };

        it('returns zero', () => {
            expect(removeBundledItems(items)).toEqual(items);
        });
    });

    describe('when there are items with parentId', () => {
        const emptyItems = {
            physicalItems: [] as PhysicalItem[],
            digitalItems: [] as DigitalItem[],
            giftCertificates: [] as GiftCertificateItem[],
            // for now, force it to be null this way.
            customItems: null as unknown as CustomItem[],
        };

        const items = {
            physicalItems: [
                {
                    ...getPhysicalItem(),
                    parentId: '123-abc',
                },
            ],
            digitalItems: [] as DigitalItem[],
            giftCertificates: [] as GiftCertificateItem[],
            // for now, force it to be null this way.
            customItems: null as unknown as CustomItem[],
        };

        it('removes items with parentId', () => {
            expect(removeBundledItems(items)).toEqual(emptyItems);
        });
    });

    describe('when there are items without parentId', () => {
        const items = {
            physicalItems: [getPhysicalItem()],
            digitalItems: [] as DigitalItem[],
            giftCertificates: [] as GiftCertificateItem[],
            // for now, force it to be null this way.
            customItems: null as unknown as CustomItem[],
        };

        it('keeps all items', () => {
            expect(removeBundledItems(items)).toEqual(items);
        });
    });
});
