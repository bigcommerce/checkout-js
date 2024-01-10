import { PaymentMethod } from '@bigcommerce/checkout-sdk';

const DISPLAY_NAME_MAP = {
    credit_card: 'Credit Card',
    ecp: 'Electronic Check Presentment',
    sepa_direct_debit: 'SEPA',
};

export function getBlueSnapDirect(
    method: keyof typeof DISPLAY_NAME_MAP = 'credit_card',
): PaymentMethod {
    return {
        clientToken: method === 'credit_card' ? 'pfToken' : '',
        config: {
            cardCode: true,
            displayName: DISPLAY_NAME_MAP[method],
            isHostedFormEnabled: true,
            testMode: true,
        },
        gateway: 'bluesnapdirect',
        id: method,
        method,
        supportedCards:
            method === 'credit_card'
                ? ['AMEX', 'CUP', 'DINERS', 'DISCOVER', 'JCB', 'MC', 'VISA']
                : [],
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            sepaCreditorCompanyName: 'Sepa Creditor Company Name',
            idealIssuers: [
                { issuerId: 'test-bank', issuerName: 'Test Bank' },
                { issuerId: 'test-bank-1', issuerName: 'Test Bank1' },
            ],
        },
    };
}
