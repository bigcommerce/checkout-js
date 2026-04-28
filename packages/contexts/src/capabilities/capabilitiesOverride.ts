// TEMP (CHECKOUT-9979): Client-side override for capability flags while the API is pending.
// Remove this file and its usage in CapabilitiesProvider.tsx on project delivery.
//
// Usage: append `?capabilitiesOverride=<url-encoded-json>` to the checkout URL, e.g.
//   ?capabilitiesOverride=%7B%22orderConfirmation%22%3A%7B%22invoiceRedirect%22%3Atrue%7D%7D
// Only the keys present in the JSON are overridden; all other values come from the API.

import { type Capabilities } from '@bigcommerce/checkout-sdk/essential';

const OVERRIDE_QUERY_PARAM = 'capabilitiesOverride';

type CapabilitiesOverride = {
    [K in keyof Capabilities]?: Partial<Capabilities[K]>;
};

function parseOverride(): CapabilitiesOverride | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    const raw = new URLSearchParams(window.location.search).get(OVERRIDE_QUERY_PARAM);

    if (!raw) {
        return undefined;
    }

    try {
        const parsed: unknown = JSON.parse(raw);

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as CapabilitiesOverride;
        }
    } catch {
        // Malformed override — fall back to API-provided capabilities.
    }

    return undefined;
}

const capabilitiesOverride = parseOverride();

export function applyCapabilitiesOverride(capabilities: Capabilities): Capabilities {
    if (!capabilitiesOverride) {
        return capabilities;
    }

    return {
        userJourney: { ...capabilities.userJourney, ...capabilitiesOverride.userJourney },
        customer: { ...capabilities.customer, ...capabilitiesOverride.customer },
        shipping: { ...capabilities.shipping, ...capabilitiesOverride.shipping },
        billing: { ...capabilities.billing, ...capabilitiesOverride.billing },
        payment: { ...capabilities.payment, ...capabilitiesOverride.payment },
        orderConfirmation: {
            ...capabilities.orderConfirmation,
            ...capabilitiesOverride.orderConfirmation,
        },
    };
}
