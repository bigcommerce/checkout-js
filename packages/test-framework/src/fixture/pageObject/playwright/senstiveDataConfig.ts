// Sensitive headers would be masked in a HAR file.
export const sensitiveHeaders = [
    'accept',
    'alt-svc',
    'authorization',
    'cf-cache-status',
    'cf-ray',
    'cookie',
    'nel',
    'referer',
    'report-to',
    'set-cookie',
    'token',
    'user-agent',
    'x-checkout-sdk-version',
    'x-request-id',
    'x-session-hash',
    'x-xsrf-token',
];

// PollyJS will ignore those headers and payloads when deciding whether to match a request.
export const ignoredHeaders = [...sensitiveHeaders, 'origin', 'x-checkout-variant'];
export const ignoredPayloads = ['hosted_form_nonce', 'session_token'];
