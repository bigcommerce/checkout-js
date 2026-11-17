/**
 * Everything about surcharging that is NOT yet confirmed with the backend lives in this file, so
 * settling the contract is a change here and nowhere else. Unconfirmed bits are marked ASSUMED.
 *
 * Scope: what happens BEFORE Place order. The FE sends the payment method and the BlueSnap pfToken
 * (`paymentMethod.clientToken`); the backend reads amount, currency and location from the checkout,
 * puts the surcharge on it as a fee and answers with a preview. The FE then reloads the checkout.
 */

// ASSUMED: the source of the fee the backend puts on the checkout.
const SURCHARGE_FEE_SOURCE = 'payment_surcharge';

export const isSurchargeFee = (fee: { source?: string }): boolean =>
    fee.source === SURCHARGE_FEE_SOURCE;

export interface SurchargeRequest {
    paymentMethod: { id: string; gateway: string | null };
    pfToken: string;
}

export interface SurchargeResult {
    eligible: boolean;
    amount: number;
    currency?: string;
    rate?: number;
    legalText?: string;
}

// ASSUMED: the path. Same route group as `/fees` and `/consignments`.
export const getSurchargeUrl = (checkoutId: string): string =>
    `/api/storefront/checkouts/${encodeURIComponent(checkoutId)}/surcharge`;

export const isValidPfToken = (pfToken: unknown): pfToken is string =>
    typeof pfToken === 'string' && pfToken.trim().length > 0;

const asString = (value: unknown) => (typeof value === 'string' ? value : undefined);
const asNumber = (value: unknown) => (typeof value === 'number' ? value : undefined);

export function parseSurchargeResult(body: unknown): SurchargeResult | undefined {
    const data = body as Record<string, unknown> | null;

    if (typeof data?.eligible !== 'boolean') {
        return undefined;
    }

    const amount = typeof data.amount === 'string' ? Number(data.amount) : data.amount;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        return undefined;
    }

    return {
        eligible: data.eligible,
        amount,
        currency: asString(data.currency),
        rate: asNumber(data.rate),
        legalText: asString(data.legalText),
    };
}
