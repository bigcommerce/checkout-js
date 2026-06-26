import { type CheckoutSettings } from '@bigcommerce/checkout-sdk';

import { isExperimentEnabled } from '../common/utility';

// STRIPE-1525 order-placement-timing POC flags. Mirrored here to avoid string drift.
export const ORDER_PLACEMENT_START_CLIENT_EVENT = 'PROJECT-8686.order_placement_start_client_event';
export const ORDER_PLACEMENT_START_SERVER_EVENT =
    'PROJECT-8686.order_placement_start_server_event';

interface ReportOrderPlacementStartOptions {
    checkoutSettings?: CheckoutSettings;
    checkoutId?: string;
    provider: string;
    methodId: string;
}

const readCookie = (name: string): string => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

    return match ? decodeURIComponent(match[1]) : '';
};

// Order-placement-start signal(s). Guarded so it can never throw into the caller.
// The server beacon is AWAITED (blocking) so its session write commits — and the session lock is
// released — before the order-submission request runs. Otherwise the two requests race and the
// later one writes back a session snapshot that clobbers the placement-start key.
export default async function reportOrderPlacementStart({
    checkoutSettings,
    checkoutId,
    provider,
    methodId,
}: ReportOrderPlacementStartOptions): Promise<void> {
    try {
        if (isExperimentEnabled(checkoutSettings, ORDER_PLACEMENT_START_CLIENT_EVENT, false)) {
            // Float seconds (ms resolution) so the server can compute tenths. Do not floor.
            const value = `${provider}:${methodId}:${Date.now() / 1000}`;

            document.cookie = `place_order=${encodeURIComponent(value)}; path=/; SameSite=Lax; Secure`;
        }

        if (
            checkoutId &&
            isExperimentEnabled(checkoutSettings, ORDER_PLACEMENT_START_SERVER_EVENT, false)
        ) {
            // Bound the wait so a slow/hung beacon can never freeze order placement.
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);

            try {
                await fetch(`/api/storefront/checkout/${checkoutId}/event`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': readCookie('XSRF-TOKEN'),
                    },
                    body: JSON.stringify({
                        event: 'placement_started',
                        payment_provider_id: provider,
                        payment_method_id: methodId,
                    }),
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeout);
            }
        }
    } catch {
        // Never block or affect order submission.
    }
}
