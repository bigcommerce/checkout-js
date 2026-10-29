const WALLET_TOKEN_INVALIDATION_IGNORED_ERROR_TYPES = new Set([
    'order_finalization_not_required',
    'payment_cancelled',
    'payment_invalid_form',
    'spam_protection_not_completed',
    'spam_protection_failed',
    'invalid_hosted_form_value',
    'cart_consistency',
    'cart_changed',
    'cart_stock_positions_changed',
    'tax_provider_unavailable',
    'missing_shipping_method',
    'invalid_shipping_address',
    'empty_cart',
    'timeout',
]);

const getErrorType = (error: unknown): string | undefined => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        typeof error.type === 'string'
    ) {
        return error.type;
    }

    return undefined;
};

const isWalletTokenInvalidationError = (error: unknown): boolean => {
    if (!error) {
        return false;
    }

    const errorType = getErrorType(error);
    const errorBodyType =
        typeof error === 'object' && 'body' in error ? getErrorType(error.body) : undefined;

    if (
        (errorType && WALLET_TOKEN_INVALIDATION_IGNORED_ERROR_TYPES.has(errorType)) ||
        (errorBodyType && WALLET_TOKEN_INVALIDATION_IGNORED_ERROR_TYPES.has(errorBodyType))
    ) {
        return false;
    }

    return true;
};

export default isWalletTokenInvalidationError;
