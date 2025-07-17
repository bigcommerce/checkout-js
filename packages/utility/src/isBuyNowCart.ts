import { Cart } from '@bigcommerce/checkout-sdk';

export default function isBuyNowCart(cart?: Cart): boolean {
    const params = new URLSearchParams(window.location.search);

    return cart?.source === 'BUY_NOW' || params.get('action') === 'buy';
}
