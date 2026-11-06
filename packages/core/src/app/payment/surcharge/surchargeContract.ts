/**
 * Everything about surcharging that is NOT yet confirmed with the backend lives in this file, so
 * that settling the contract is a change here and nowhere else. Each unconfirmed bit is marked ASSUMED.
 *
 * Scope of the PoC: what happens BEFORE the shopper clicks Place order. The shopper types the card, the
 * FE sends the pfToken, the backend decides the surcharge and puts it on the checkout as a fee, and the FE
 * reloads the checkout. (The reactive flow of spike PI-5347 - a 400 on the payment, then a fee - is not
 * part of it.)
 */

// ASSUMED: the source of the fee the backend puts on the checkout. The FE only recognises it.
const SURCHARGE_FEE_SOURCE = 'payment_surcharge';

// True for the surcharge fee on the checkout, so the order summary can single it out.
export function isSurchargeFee(fee: { source?: string }): boolean {
    return fee.source === SURCHARGE_FEE_SOURCE;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Surcharge endpoint (proposal): "what is the surcharge for this card?",
 * Nothing is charged. The backend puts the
 * answer on the checkout as a fee (replacing or removing an earlier one). The backend takes the amount, the currency and the shopper's location from
 * the checkout itself; the browser sends only the payment method and the BlueSnap pfToken (the
 * payment fields token, `paymentMethod.clientToken`) the card was entered under.
 */
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
export function getSurchargeUrl(checkoutId: string): string {
    return `/api/storefront/checkouts/${encodeURIComponent(checkoutId)}/surcharge`;
}

export const isValidPfToken = (pfToken: unknown): pfToken is string =>
    typeof pfToken === 'string' && pfToken.trim().length > 0;

export function getSurchargeRequestBody({
    paymentMethod,
    pfToken,
}: SurchargeRequest): SurchargeRequest {
    return { paymentMethod: { id: paymentMethod.id, gateway: paymentMethod.gateway }, pfToken };
}

export function parseSurchargeResult(body: unknown): SurchargeResult | undefined {
    if (!isRecord(body) || typeof body.eligible !== 'boolean') {
        return undefined;
    }

    const amount = typeof body.amount === 'string' ? Number(body.amount) : body.amount;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        return undefined;
    }

    return {
        eligible: body.eligible,
        amount,
        currency: typeof body.currency === 'string' ? body.currency : undefined,
        rate: typeof body.rate === 'number' ? body.rate : undefined,
        legalText: typeof body.legalText === 'string' ? body.legalText : undefined,
    };
}
