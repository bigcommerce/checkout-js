// Sensitive headers would be masked in a HAR file.
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

// PollyJS will ignore those headers and payloads when deciding whether to match a request.
export const ignoredHeaders = [
    ...sensitiveHeaders,
    'origin',
    'x-checkout-variant',
];
export const ignoredPayloads = [
    'hosted_form_nonce',
    'session_token',
];
