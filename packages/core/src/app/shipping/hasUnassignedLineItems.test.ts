import { Consignment, LineItemMap } from '@bigcommerce/checkout-sdk';

import { getPhysicalItem } from '../cart/lineItem.mock';

import { getConsignment } from './consignment.mock';
import hasUnassignedLineItems from './hasUnassignedLineItems';

describe('hasUnassignedLineItems()', () => {
    let consignments: Consignment[];
    let lineItems: LineItemMap;

    beforeEach(() => {
        consignments = [];
        lineItems = {
            digitalItems: [],
            giftCertificates: [],
            physicalItems: [],
        };
    });

    it('returns true if there are more physical items in cart than items allocated to consignments', () => {
        lineItems = {
            ...lineItems,
            physicalItems: [getPhysicalItem(), getPhysicalItem(), getPhysicalItem()],
        };

        expect(hasUnassignedLineItems(consignments, lineItems)).toBe(true);
    });

    it('returns false if all physical items in cart are allocated to consignments', () => {
        consignments = [
            {
                ...getConsignment(),
                lineItemIds: [`${getPhysicalItem().id}`],
            },
        ];

        lineItems = {
            ...lineItems,
            physicalItems: [getPhysicalItem()],
        };

        expect(hasUnassignedLineItems(consignments, lineItems)).toBe(false);
    });

    it('returns false if all physical items in cart except items added by promotion are allocated to consignments', () => {
        consignments = [
            {
                ...getConsignment(),
                lineItemIds: [`${getPhysicalItem().id}`],
            },
        ];

        lineItems = {
            ...lineItems,
            physicalItems: [getPhysicalItem(), { ...getPhysicalItem(), addedByPromotion: true }],
        };

        expect(hasUnassignedLineItems(consignments, lineItems)).toBe(false);
    });
});
