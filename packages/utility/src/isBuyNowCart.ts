import { type Cart } from '@bigcommerce/checkout-sdk';

export default function isBuyNowCart(cart?: Cart): boolean {
    const lastPathName = window.location.pathname.split('/').pop();
    const params = new URLSearchParams(window.location.search);

    return (
        cart?.source === 'BUY_NOW' ||
        params.get('action') === 'buy' ||
        !(lastPathName === 'checkout' || lastPathName === 'embedded-checkout')
    );
}
