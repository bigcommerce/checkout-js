import CheckoutSupport from './CheckoutSupport';

export default class NoopCheckoutSupport implements CheckoutSupport {
    isSupported(): boolean {
        return true;
    }
}
