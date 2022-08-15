export default interface CheckoutSupport {
    /**
     * Check if a feature is supported.
     *
     * If a feature is not supported, the call will throw an error.
     * Otherwise, it will return true. It will always return true if the
     * application is not running as Embedded Checkout.
     */
    isSupported(...ids: string[]): boolean;
}
