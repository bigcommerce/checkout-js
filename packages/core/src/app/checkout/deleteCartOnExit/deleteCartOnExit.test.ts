import { deleteCartOnExit } from './deleteCartOnExit';

describe('deleteCartOnExit', () => {
    let getOrder: jest.Mock;
    let getCheckout: jest.Mock;
    let isSubmittingOrder: jest.Mock;
    let deleteCheckout: jest.Mock;
    let checkoutService: any;
    let navigationListeners: Record<string, (event: { navigationType?: string }) => void>;
    let cleanup: (() => void) | undefined;

    const fireUnload = (
        type: 'pagehide' | 'beforeunload',
        { persisted }: { persisted?: boolean } = {},
    ): void => {
        const event = new Event(type);

        if (persisted !== undefined) {
            Object.defineProperty(event, 'persisted', { value: persisted, configurable: true });
        }

        window.dispatchEvent(event);
    };

    const watchForExit = (): void => {
        cleanup = deleteCartOnExit(checkoutService);
    };

    beforeEach(() => {
        getOrder = jest.fn().mockReturnValue(undefined);
        getCheckout = jest.fn().mockReturnValue({ id: 'checkout-123' });
        isSubmittingOrder = jest.fn().mockReturnValue(false);
        deleteCheckout = jest.fn().mockResolvedValue(undefined);

        checkoutService = {
            deleteCheckout,
            getState: () => ({
                data: { getOrder, getCheckout },
                statuses: { isSubmittingOrder },
            }),
        };

        navigationListeners = {};
        (window as any).navigation = {
            addEventListener: jest.fn(
                (type: string, cb: (event: { navigationType?: string }) => void) => {
                    navigationListeners[type] = cb;
                },
            ),
            removeEventListener: jest.fn(),
        };
    });

    afterEach(() => {
        cleanup?.();
        cleanup = undefined;
        jest.clearAllMocks();
        delete (window as any).navigation;
    });

    it('deletes the checkout on a plain leave', () => {
        watchForExit();

        fireUnload('pagehide');

        expect(deleteCheckout).toHaveBeenCalledTimes(1);
    });

    it('does not delete on a keyboard reload (F5)', () => {
        watchForExit();

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5' }));
        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('does not delete on a Navigation API reload', () => {
        watchForExit();

        navigationListeners.navigate?.({ navigationType: 'reload' });
        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('does not delete when an order has been placed', () => {
        getOrder.mockReturnValue({ orderId: 1 });
        watchForExit();

        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('does not delete while an order is being submitted', () => {
        isSubmittingOrder.mockReturnValue(true);
        watchForExit();

        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('does not delete on a bfcache pagehide', () => {
        watchForExit();

        fireUnload('pagehide', { persisted: true });

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('does not delete when there is no checkout', () => {
        getCheckout.mockReturnValue(undefined);
        watchForExit();

        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });

    it('fires at most once across beforeunload and pagehide', () => {
        watchForExit();

        fireUnload('beforeunload');
        fireUnload('pagehide');

        expect(deleteCheckout).toHaveBeenCalledTimes(1);
    });

    it('stops deleting after cleanup', () => {
        watchForExit();

        cleanup?.();
        cleanup = undefined;
        fireUnload('pagehide');

        expect(deleteCheckout).not.toHaveBeenCalled();
    });
});
