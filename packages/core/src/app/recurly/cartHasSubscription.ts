import { Cart } from '@bigcommerce/checkout-sdk';

import { apiEndpoint } from './config';

export default async function cartHasSubscription(cart: Cart, store: string): Promise<boolean> {
    const response = await fetch(`${apiEndpoint}/api/recurly/check-cart`, {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({store, skus: cart.lineItems.physicalItems.map(item => item.sku)}),
    });
    const result = await response.json();
    if (response.status !== 200) {
        throw new Error(result.message);
    }

    return result.hasPlan;
}
