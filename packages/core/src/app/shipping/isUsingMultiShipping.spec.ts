import { Consignment, LineItemMap } from '@bigcommerce/checkout-sdk';

import { getPhysicalItem } from '../cart/lineItem.mock';

import { getConsignment } from './consignment.mock';
import isUsingMultiShipping from './isUsingMultiShipping';

describe('isUsingMultiShipping()', () => {
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

    it('returns true if there are more than one consignment', () => {
        consignments = [getConsignment(), getConsignment()];

        expect(isUsingMultiShipping(consignments, lineItems)).toBe(true);
    });

    it('returns false if there is only one consignment without unassigned physical items', () => {
        consignments = [getConsignment()];
        lineItems = {
            digitalItems: [],
            giftCertificates: [],
            physicalItems: [getPhysicalItem()],
        };

        expect(isUsingMultiShipping(consignments, lineItems)).toBe(false);
    });

    it('returns true if there are unassigned physical items', () => {
        consignments = [getConsignment()];
        lineItems = {
            ...lineItems,
            physicalItems: [getPhysicalItem(), getPhysicalItem(), getPhysicalItem()],
        };

        expect(isUsingMultiShipping(consignments, lineItems)).toBe(true);
    });
});
