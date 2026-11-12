/**
 * PoC contract for card surcharging (BlueSnap). Flow: the FE posts the pfToken to bcapp, bcapp answers
 * adds/replaces the `card_surcharge` fee on the checkout and answers, the FE reloads the checkout and
 * echoes `providerData` into the payment request. bcapp derives amount, currency and location from the cart.
 */

// Source of the fee bcapp puts on the checkout. The FE only recognises it.
export const SURCHARGE_FEE_SOURCE = 'card_surcharge';

// True for the surcharge fee on the checkout, so the order summary can single it out.
export function isSurchargeFee(fee: { source?: string }): boolean {
    return fee.source === SURCHARGE_FEE_SOURCE;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export interface SurchargeRequest {
    paymentMethod: { id: string; gateway: string | null };
    pfToken: string;
}

export interface SurchargeResult {
    eligible: boolean;
    amount: number;
    rate?: number;
    // Opaque. Always echoed into the payment, even when not eligible.
    providerData: Record<string, unknown>;
}

export const NO_SURCHARGE: SurchargeResult = { eligible: false, amount: 0, providerData: {} };

export const SURCHARGE_URL = '/api/storefront/payments/surcharge';

export const isValidPfToken = (pfToken: unknown): pfToken is string =>
    typeof pfToken === 'string' && pfToken.trim().length > 0;

// The payment method id bcapp expects, e.g. `bluesnapdirect.credit_card`.
export const getSurchargePaymentMethodId = ({ id, gateway }: SurchargeRequest['paymentMethod']) =>
    gateway ? `${gateway}.${id}` : id;

export function parseSurchargeResult(body: unknown): SurchargeResult | undefined {
    if (!isRecord(body) || typeof body.eligible !== 'boolean') {
        return undefined;
    }

    const amount = Number(body.surchargeAmount);
    const rate = Number(body.surchargeRate);

    if (!Number.isFinite(amount) || amount < 0) {
        return undefined;
    }

    return {
        eligible: body.eligible,
        amount,
        rate: Number.isFinite(rate) ? rate : undefined,
        providerData: isRecord(body.providerData) ? body.providerData : {},
    };
}
