export default function mapErrorMessage(
    error: any, // TODO: Export `RequestError`
    translate: (key: string) => string,
): string {
    const type = error.body && error.body.type;

    switch (type) {
        case 'throttled_login':
            return translate('customer.sign_in_throttled_error');

        case 'reset_password_before_login':
            return translate('customer.reset_password_before_login_error');

        case 'empty_cart':
            return translate('cart.empty_cart_error_message');

        default:
            return translate('customer.sign_in_error');
    }
}
