import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

import { getOrder } from '../orders.mock';

import { waitForOrderCompletion } from './waitForOrderCompletion';

const createState = (isComplete: boolean): CheckoutSelectors =>
    ({
        data: { getOrder: () => ({ ...getOrder(), isComplete }) },
    }) as unknown as CheckoutSelectors;

describe('waitForOrderCompletion', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns true without reloading when the order is already complete', async () => {
        const loadOrder = jest.fn();

        await expect(
            waitForOrderCompletion({
                initialState: createState(true),
                orderId: 1,
                isCancelled: () => false,
                loadOrder,
            }),
        ).resolves.toBe(true);

        expect(loadOrder).not.toHaveBeenCalled();
    });

    it('retries every second until the order is complete', async () => {
        const loadOrder = jest
            .fn()
            .mockResolvedValueOnce(createState(false))
            .mockResolvedValueOnce(createState(true));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            orderId: 1,
            isCancelled: () => false,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(999);
        expect(loadOrder).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(1);
        expect(loadOrder).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(1000);

        await expect(promise).resolves.toBe(true);
        expect(loadOrder).toHaveBeenCalledTimes(2);
        expect(loadOrder).toHaveBeenCalledWith(1);
    });

    it('returns false after 5 retries when the order never completes', async () => {
        const loadOrder = jest.fn().mockResolvedValue(createState(false));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            orderId: 1,
            isCancelled: () => false,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(10000);

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(5);
    });

    it('returns false without throwing when a retry fails', async () => {
        const loadOrder = jest.fn().mockRejectedValue(new Error('network'));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            orderId: 1,
            isCancelled: () => false,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(10000);

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(1);
    });

    it('stops retrying once cancelled', async () => {
        let cancelled = false;
        const loadOrder = jest.fn().mockResolvedValue(createState(false));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            orderId: 1,
            isCancelled: () => cancelled,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(1000);
        expect(loadOrder).toHaveBeenCalledTimes(1);

        cancelled = true;
        await jest.advanceTimersByTimeAsync(10000);

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(1);
    });
});
