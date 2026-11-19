import { createRequestSender, type RequestSender } from '@bigcommerce/request-sender';

import {
    getSurchargePaymentMethodId,
    NO_SURCHARGE,
    parseSurchargeResult,
    SURCHARGE_URL,
    type SurchargeRequest,
    type SurchargeResult,
} from './surchargeContract';

export interface RequestSurchargeStateOptions extends SurchargeRequest {
    checkoutId: string;
    requestSender?: RequestSender;
}

// createRequestSender() sends the XSRF-TOKEN cookie as X-XSRF-TOKEN and uses same-origin cookies.
const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-API-INTERNAL': 'This API endpoint is for internal use only and may change in the future',
};

// Asks bcapp for the surcharge of the card paid with this pfToken. bcapp adds, replaces or removes the
// `card_surcharge` fee on the checkout itself; the FE only reloads the checkout afterwards. 400 (method does not
// support surcharging) means "no surcharge". Other errors reject.
export async function requestSurcharge({
    checkoutId,
    paymentMethod,
    pfToken,
    requestSender = createRequestSender(),
}: RequestSurchargeStateOptions): Promise<SurchargeResult> {
    try {
        const response = await requestSender.post<unknown>(SURCHARGE_URL, {
            body: {
                cartId: checkoutId,
                pfToken,
                paymentMethodId: getSurchargePaymentMethodId(paymentMethod),
            },
            headers,
        });
        const result = parseSurchargeResult(response.body);

        if (!result) {
            throw new Error('Unexpected surcharge response');
        }

        return result;
    } catch (error) {
        if ((error as { status?: number })?.status === 400) {
            return NO_SURCHARGE;
        }

        throw error;
    }
}

// Removes the `card_surcharge` fee from the checkout. bcapp does not call BigPay for this and answers
// `{ removed: boolean }` (idempotent: `removed: false` when there was no fee). `cartId` is a query
// parameter on purpose, proxies often drop a DELETE body. Rejects on any non-2xx answer.
export async function removeSurcharge({
    checkoutId,
    requestSender = createRequestSender(),
}: {
    checkoutId: string;
    requestSender?: RequestSender;
}): Promise<void> {
    await requestSender.delete(SURCHARGE_URL, { params: { cartId: checkoutId }, headers });
}
