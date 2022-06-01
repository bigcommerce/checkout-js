// Sensitive headers in a HAR file would be masked.
export const sensitiveHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'token',
    'x-session-hash',
    'x-xsrf-token',
    'referer',
    'user-agent',
    'x-checkout-sdk-version',
    'accept',
    'x-request-id',
];

// When deciding whether or not to match a request, PollyJS will ignore them.
export const ignoredHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'token',
    'x-session-hash',
    'x-xsrf-token',
    'referer',
    'user-agent',
    'x-checkout-sdk-version',
    'accept',
    'origin',
    'x-checkout-variant',
];
export const ignoredPayloads = [
    'hosted_form_nonce',
    'session_token',
];
