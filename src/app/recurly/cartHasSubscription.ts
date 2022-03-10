import { Cart } from '@bigcommerce/checkout-sdk';

import config from './config';

export default async function cartHasSubscription(cart: Cart): Promise<boolean> {
    const response = await fetch(`${config.apiEndpoint}/api/recurly/check-cart`, {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({skus: cart.lineItems.physicalItems.map(item => item.sku)}),
    });
    const result = await response.json();
    if (response.status !== 200) {
        throw new Error(result.message);
    }

    return result.hasPlan;
}
