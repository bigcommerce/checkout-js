import { type ConsignmentCreateRequestBody } from '@bigcommerce/checkout-sdk';
import { act, renderHook } from '@testing-library/react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { consignment } from '@bigcommerce/checkout/test-framework';

import { useDeallocateItem } from './useDeallocateItem';

jest.mock('@bigcommerce/checkout/payment-integration-api');

describe('useDeallocateItem', () => {
    const createConsignments = jest.fn();
    const deleteConsignment = jest.fn();
    const consignmentRequest: ConsignmentCreateRequestBody = {
        address: consignment.address,
        shippingAddress: consignment.shippingAddress,
        lineItems: [{ itemId: 'x', quantity: 1 }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useCheckout as jest.Mock).mockReturnValue({
            checkoutService: { createConsignments, deleteConsignment },
        });
    });

    it('should delete consignment if it has only one item', async () => {
        const { result: {
            current: deallocateItem,
        } } = renderHook(() => useDeallocateItem());

        await act(async () => {
            await deallocateItem(consignmentRequest, 'x', { ...consignment, lineItemIds: ['x'] });
        });

        expect(deleteConsignment).toHaveBeenCalledWith('consignment-1');
        expect(createConsignments).not.toHaveBeenCalled();
    });

    it('should create new consignment and delete the old one if it has multiple items', async () => {
        const newConsignment = { ...consignment, id: 'consignment-2', lineItemIds: ['y'] };

        createConsignments.mockResolvedValue({
            data: {
                getConsignments: () => [newConsignment],
            },
        });

        const { result: {
            current: deallocateItem,
        } } = renderHook(() => useDeallocateItem());

        await act(async () => {
            await deallocateItem(
                consignmentRequest,
                'y',
                { ...consignment, lineItemIds: ['y','z'] },
                );
        });

        expect(createConsignments).toHaveBeenCalledWith([consignmentRequest]);
        expect(deleteConsignment).toHaveBeenCalledWith('consignment-2');
    });

    it('should throw an error if consignment to be deleted is not found', async () => {
        createConsignments.mockResolvedValue({
            data: {
                getConsignments: () => [],
            },
        });

        const { result: {
            current: deallocateItem,
        } } = renderHook(() => useDeallocateItem());

        await expect(
            () => deallocateItem(
                consignmentRequest,
                'x',
                { ...consignment, lineItemIds: ['x', 'y'] },
                ),
        ).rejects.toThrow('Unable to find consignment to delete');

        expect(createConsignments).toHaveBeenCalledWith([consignmentRequest]);
        expect(deleteConsignment).not.toHaveBeenCalled();
    });
});
