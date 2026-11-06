import { createRequestSender, type RequestSender } from '@bigcommerce/request-sender';

import {
    getSurchargeRequestBody,
    getSurchargeUrl,
    parseSurchargeResult,
    type SurchargeRequest,
    type SurchargeResult,
} from './surchargeContract';

export interface RequestSurchargeStateOptions extends SurchargeRequest {
    checkoutId: string;
    requestSender?: RequestSender;
}

// Asks the backend what surcharge the card paid with this pfToken would get on this checkout. Rejects on a
// non-2xx answer or on a body that is not a surcharge result.
export async function requestSurcharge({
    checkoutId,
    paymentMethod,
    pfToken,
    requestSender = createRequestSender(),
}: RequestSurchargeStateOptions): Promise<SurchargeResult> {
    const response = await requestSender.post<unknown>(getSurchargeUrl(checkoutId), {
        body: getSurchargeRequestBody({ paymentMethod, pfToken }),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    const result = parseSurchargeResult(response.body);

    if (!result) {
        throw new Error('Unexpected surcharge response');
    }

    return result;
}
