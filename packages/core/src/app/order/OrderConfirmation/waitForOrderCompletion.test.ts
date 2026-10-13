import { type CheckoutSelectors } from '@bigcommerce/checkout-sdk';

import { getOrder } from '../orders.mock';

import { ORDER_COMPLETION_RETRY_DELAYS, waitForOrderCompletion } from './waitForOrderCompletion';

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

    it('resolves true without reloading when the initial order is complete', async () => {
        const loadOrder = jest.fn();

        await expect(
            waitForOrderCompletion({
                initialState: createState(true),
                isCancelled: () => false,
                loadOrder,
            }),
        ).resolves.toBe(true);

        expect(loadOrder).not.toHaveBeenCalled();
    });

    it('resolves true as soon as a reload returns a complete order', async () => {
        const loadOrder = jest
            .fn()
            .mockResolvedValueOnce(createState(false))
            .mockResolvedValueOnce(createState(true));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            isCancelled: () => false,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(500 + 1000);

        await expect(promise).resolves.toBe(true);
        expect(loadOrder).toHaveBeenCalledTimes(2);
    });

    it('resolves false after exhausting the retry budget', async () => {
        const loadOrder = jest.fn().mockResolvedValue(createState(false));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            isCancelled: () => false,
            loadOrder,
        });

        await jest.runAllTimersAsync();

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(ORDER_COMPLETION_RETRY_DELAYS.length);
    });

    it('waits the configured delay before each reload', async () => {
        const loadOrder = jest.fn().mockResolvedValue(createState(false));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            delays: [100, 200],
            isCancelled: () => false,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(99);
        expect(loadOrder).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(1);
        expect(loadOrder).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(199);
        expect(loadOrder).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(1);
        expect(loadOrder).toHaveBeenCalledTimes(2);

        await expect(promise).resolves.toBe(false);
    });

    it('resolves false and stops retrying when a reload fails', async () => {
        const loadOrder = jest.fn().mockRejectedValue(new Error('boom'));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            isCancelled: () => false,
            loadOrder,
        });

        await jest.runAllTimersAsync();

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(1);
    });

    it('resolves false and stops reloading once cancelled', async () => {
        let cancelled = false;
        const loadOrder = jest.fn().mockResolvedValue(createState(false));

        const promise = waitForOrderCompletion({
            initialState: createState(false),
            isCancelled: () => cancelled,
            loadOrder,
        });

        await jest.advanceTimersByTimeAsync(500);
        expect(loadOrder).toHaveBeenCalledTimes(1);

        cancelled = true;
        await jest.runAllTimersAsync();

        await expect(promise).resolves.toBe(false);
        expect(loadOrder).toHaveBeenCalledTimes(1);
    });
});
