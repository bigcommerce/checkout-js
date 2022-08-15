import { Cart, Consignment } from '@bigcommerce/checkout-sdk';

import { getAddress } from '../address/address.mock';
import { getCart } from '../cart/carts.mock';
import { getPhysicalItem } from '../cart/lineItem.mock';

import { getConsignment } from './consignment.mock';
import getShippableLineItems from './getShippableLineItems';
import updateShippableItems from './updateShippableItems';

describe('updateShippableItems()', () => {
    let cart: Cart = {
        ...getCart(),
        lineItems: {
            ...getCart().lineItems,
            physicalItems: [
                {
                    ...getPhysicalItem(),
                    quantity: 3,
                    id: 'foo',
                },
            ],
        },
    };

    let consignments: Consignment[];

    it('returns undefined when invalid index', () => {
        expect(
            updateShippableItems(
                getShippableLineItems(cart, []),
                { address: getAddress(), updatedItemIndex: -1 },
                { cart: undefined, consignments: [] },
            ),
        ).toBeFalsy();

        expect(
            updateShippableItems(
                getShippableLineItems(cart, []),
                { address: getAddress(), updatedItemIndex: 3 },
                { cart: undefined, consignments: [] },
            ),
        ).toBeFalsy();
    });

    it('returns undefined when no cart index', () => {
        expect(
            updateShippableItems(
                getShippableLineItems(cart, []),
                { address: getAddress(), updatedItemIndex: 0 },
                { cart: undefined, consignments: [] },
            ),
        ).toBeFalsy();
    });

    it('updates all items when no consignments', () => {
        const shippableItems = getShippableLineItems(cart, []);
        const updatedShippableItems = updateShippableItems(
            shippableItems,
            { address: getAddress(), updatedItemIndex: 1 },
            { cart, consignments: [] },
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(updatedShippableItems![0].consignment).toBeFalsy();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(updatedShippableItems![1].consignment).toBeFalsy();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(updatedShippableItems![2].consignment).toBeFalsy();
    });

    describe('when item is not split', () => {
        beforeEach(() => {
            consignments = [
                {
                    ...getConsignment(),
                    shippingAddress: getAddress(),
                    lineItemIds: ['bar'],
                },
            ];
        });

        it('updates all items when no consignments', () => {
            const shippableItems = getShippableLineItems(cart, []);
            const updatedShippableItems = updateShippableItems(
                shippableItems,
                { address: getAddress(), updatedItemIndex: 1 },
                { cart, consignments: [] },
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![0].consignment).toBeFalsy();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![1].consignment).toBeFalsy();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![2].consignment).toBeFalsy();
        });

        it('updates specific item when a line item gets split', () => {
            const shippableItems = getShippableLineItems(cart, []);
            const updatedShippableItems = updateShippableItems(
                shippableItems,
                {
                    address: getAddress(),
                    updatedItemIndex: 1,
                },
                {
                    cart: {
                        ...cart,
                        lineItems: {
                            ...cart.lineItems,
                            physicalItems: [
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'foo',
                                    quantity: 1,
                                },
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'bar',
                                    quantity: 1,
                                },
                            ],
                        },
                    },
                    consignments,
                },
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![0]).toEqual(shippableItems[0]);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![0]).toBe(shippableItems[0]);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![2]).toEqual(shippableItems[2]);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![1]).toMatchObject({
                consignment: consignments[0],
                id: 'bar',
            });
        });
    });

    describe('when item is split', () => {
        beforeEach(() => {
            cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [
                        {
                            ...getPhysicalItem(),
                            quantity: 2,
                            id: 'foo',
                        },
                        {
                            ...getPhysicalItem(),
                            quantity: 1,
                            id: 'bar',
                        },
                    ],
                },
            };

            consignments = [
                {
                    ...getConsignment(),
                    shippingAddress: getAddress(),
                    lineItemIds: ['foo'],
                },
                {
                    ...getConsignment(),
                    shippingAddress: {
                        ...getAddress(),
                        address1: 'x',
                    },
                    lineItemIds: ['bar'],
                },
            ];
        });

        it('updates other item when a line item gets merged back keeping its id', () => {
            cart.lineItems.physicalItems[0].quantity = 1;

            const shippableItems = getShippableLineItems(cart, consignments);
            const updatedItemIndex = shippableItems.findIndex((item) => item.id === 'bar');

            const updatedShippableItems = updateShippableItems(
                shippableItems,
                {
                    address: getAddress(),
                    updatedItemIndex,
                },
                {
                    cart: {
                        ...cart,
                        lineItems: {
                            ...cart.lineItems,
                            physicalItems: [
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'bar',
                                    quantity: 2,
                                },
                            ],
                        },
                    },
                    consignments: [
                        {
                            ...getConsignment(),
                            shippingAddress: getAddress(),
                            lineItemIds: ['bar'],
                        },
                    ],
                },
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![0]).toMatchObject({
                consignment: {
                    ...consignments[0],
                    lineItemIds: ['bar'],
                },
                id: 'bar',
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![1]).toMatchObject({
                consignment: {
                    ...consignments[0],
                    lineItemIds: ['bar'],
                },
                id: 'bar',
            });
        });

        it('updates specific item when a line item gets merged back', () => {
            const shippableItems = getShippableLineItems(cart, consignments);
            const updatedItemIndex = shippableItems.findIndex((item) => item.id === 'bar');

            const updatedShippableItems = updateShippableItems(
                shippableItems,
                {
                    address: getAddress(),
                    updatedItemIndex,
                },
                {
                    cart: {
                        ...cart,
                        lineItems: {
                            ...cart.lineItems,
                            physicalItems: [
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'foo',
                                    quantity: 3,
                                },
                            ],
                        },
                    },
                    consignments: [
                        {
                            ...getConsignment(),
                            shippingAddress: getAddress(),
                            lineItemIds: ['foo'],
                        },
                    ],
                },
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![updatedItemIndex]).toMatchObject({
                consignment: consignments[0],
                id: 'foo',
            });
        });

        it('updates specific item id and consignment when a line item gets moved', () => {
            const shippableItems = getShippableLineItems(cart, consignments);
            const updatedItemIndex = shippableItems.findIndex((item) => item.id === 'foo');
            const updatedShippableItems = updateShippableItems(
                shippableItems,
                {
                    address: {
                        ...getAddress(),
                        address1: 'x',
                    },
                    updatedItemIndex,
                },
                {
                    cart: {
                        ...cart,
                        lineItems: {
                            ...cart.lineItems,
                            physicalItems: [
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'foo',
                                    quantity: 1,
                                },
                                {
                                    ...cart.lineItems.physicalItems[0],
                                    id: 'bar',
                                    quantity: 2,
                                },
                            ],
                        },
                    },
                    consignments,
                },
            );

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(updatedShippableItems![updatedItemIndex]).toMatchObject({
                consignment: consignments[1],
                id: 'bar',
            });
        });
    });
});
