export default function isBuyNowCart(): boolean {
    const lastPathName = window.location.pathname.split('/').pop();

    return !(lastPathName === 'checkout' || lastPathName === 'embedded-checkout');
}
