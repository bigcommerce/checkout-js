import { TokenPayload } from '@recurly/recurly-js';

import config from './config';

export interface RecurlySubmission {
    token: TokenPayload;
    currency: string;
    cartId: string;
    store: string;
    orderId?: number;
    threeDSecureToken?: any;
}

export async function submitOrder(data: RecurlySubmission) {
    const response = await fetch(`${config.apiEndpoint}/api/recurly/submit-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.status === 422) {
        throw result;
    }

    if (response.status !== 200) {
        throw result;
    }

    return result;
}
