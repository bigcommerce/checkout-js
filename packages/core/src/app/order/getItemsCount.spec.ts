import {
    CustomItem,
    DigitalItem,
    GiftCertificateItem,
    PhysicalItem,
} from '@bigcommerce/checkout-sdk';

import {
    getCustomItem,
    getDigitalItem,
    getGiftCertificateItem,
    getPhysicalItem,
} from '../cart/lineItem.mock';

import getItemsCount from './getItemsCount';

describe('getItemsCount()', () => {
    describe('when there are no items', () => {
        const items = {
            physicalItems: [] as PhysicalItem[],
            digitalItems: [] as DigitalItem[],
            giftCertificates: [] as GiftCertificateItem[],
            // todo: update type to accept optional customItems in SDK as it's not always present
            // for now, force it to be null this way.
            customItems: null as unknown as CustomItem[],
        };

        it('returns zero', () => {
            expect(getItemsCount(items)).toBe(0);
        });
    });

    describe('when there are items', () => {
        const items = {
            physicalItems: [
                getPhysicalItem(),
                {
                    ...getPhysicalItem(),
                    quantity: 2,
                },
            ],
            digitalItems: [getDigitalItem()],
            giftCertificates: [getGiftCertificateItem()],
            customItems: [getCustomItem()],
        };

        it('returns all quantities summed up', () => {
            expect(getItemsCount(items)).toBe(7);
        });
    });
});
