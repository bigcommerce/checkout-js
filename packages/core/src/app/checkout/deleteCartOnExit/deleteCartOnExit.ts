import { type CheckoutService } from '@bigcommerce/checkout-sdk';

import { watchForReload } from './reloadIntent';

export function deleteCartOnExit(checkoutService: CheckoutService): () => void {
    let isDeletingCheckout = false;

    const reloadWatcher = watchForReload();

    const shouldSkipDelete = (): boolean => {
        const state = checkoutService.getState();

        return Boolean(state.data.getOrder()) || state.statuses.isSubmittingOrder();
    };

    const deleteCartHandler = (event: Event): void => {
        if (isDeletingCheckout) {
            return;
        }

        // bfcache: the page is frozen, not destroyed, and may return via Back.
        if ('persisted' in event && (event as PageTransitionEvent).persisted) {
            return;
        }

        if (reloadWatcher.isReloadIntended()) {
            return;
        }

        if (shouldSkipDelete()) {
            return;
        }

        if (!checkoutService.getState().data.getCheckout()) {
            return;
        }

        isDeletingCheckout = true;

        void checkoutService.deleteCheckout().catch(() => {
            // Intentionally ignored.
        });
    };

    window.addEventListener('pagehide', deleteCartHandler);
    window.addEventListener('beforeunload', deleteCartHandler);

    return (): void => {
        window.removeEventListener('pagehide', deleteCartHandler);
        window.removeEventListener('beforeunload', deleteCartHandler);
        reloadWatcher.stop();
    };
}
