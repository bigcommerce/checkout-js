import { createRequestSender, type RequestSender } from '@bigcommerce/request-sender';

import {
    getSurchargeUrl,
    parseSurchargeResult,
    type SurchargeRequest,
    type SurchargeResult,
} from './surchargeContract';

export interface RequestSurchargeOptions extends SurchargeRequest {
    checkoutId: string;
    requestSender?: RequestSender;
}

// Asks the backend what surcharge this card would get on this checkout. Rejects on a non-2xx answer
// or on a body that is not a surcharge result.
export async function requestSurcharge({
    checkoutId,
    paymentMethod,
    pfToken,
    requestSender = createRequestSender(),
}: RequestSurchargeOptions): Promise<SurchargeResult> {
    const { body } = await requestSender.post<unknown>(getSurchargeUrl(checkoutId), {
        body: { paymentMethod: { id: paymentMethod.id, gateway: paymentMethod.gateway }, pfToken },
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    const result = parseSurchargeResult(body);

    if (!result) {
        throw new Error('Unexpected surcharge response');
    }

    return result;
}
