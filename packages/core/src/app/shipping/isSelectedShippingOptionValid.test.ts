import { type Consignment } from '@bigcommerce/checkout-sdk';

import { getConsignment, getShippingOption } from '@bigcommerce/checkout/test-mocks';

import isSelectedShippingOptionValid from './isSelectedShippingOptionValid';

describe('isSelectedShippingOptionValid', () => {
    let consignments: Consignment[];

    beforeEach(() => {
        consignments = [getConsignment()]
    })

    it('returns true if selected option is in available option', () => {
        expect(isSelectedShippingOptionValid(consignments)).toBe(true);
    });

    it('returns false if one of consignment does not have valid option', () => {
        const consignment2 = {
            ...getConsignment(),
            selectedShippingOption: {
                ...getShippingOption(),
                id: '1'
            }
        };

        consignments.push(consignment2);

        expect(isSelectedShippingOptionValid(consignments)).toBe(false);
    });

    it('returns true if shipping option selected is custom', () => {
        const customConsignment = {
            ...getConsignment(),
            selectedShippingOption: {
                id: "",
                type: "custom",
                description: "test",
                imageUrl: "",
                cost: 5,
                transitTime: "",
                additionalDescription: "",
                isRecommended: false,
            }
        };

        expect(isSelectedShippingOptionValid([customConsignment])).toBe(true);
    });

    it('returns true if shipping option selected is custom and selected option is present in available option in second consignment', () => {
        const customConsignment = {
            ...getConsignment(),
            selectedShippingOption: {
                id: "",
                type: "custom",
                description: "test",
                imageUrl: "",
                cost: 5,
                transitTime: "",
                additionalDescription: "",
                isRecommended: false,
            }
        };

        consignments.push(customConsignment);

        expect(isSelectedShippingOptionValid(consignments)).toBe(true);
    });

    it('returns false if shipping option selected is custom but selected option is not in available option in second consignment', () => {
        const customConsignment = {
            ...getConsignment(),
            selectedShippingOption: {
                id: "",
                type: "custom",
                description: "test",
                imageUrl: "",
                cost: 5,
                transitTime: "",
                additionalDescription: "",
                isRecommended: false,
            }
        };

        const invalidConsignment = {
            ...getConsignment(),
            selectedShippingOption: {
                ...getShippingOption(),
                id: '1'
            }
        };

        expect(isSelectedShippingOptionValid([customConsignment, invalidConsignment])).toBe(false);
    });
});
