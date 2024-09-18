import {
    AccountInstrument,
    AchInstrument,
    BankInstrument,
    CardInstrument,
    PaymentInstrument,
} from '@bigcommerce/checkout-sdk';

export enum UntrustedShippingCardVerificationType {
    CVV = 'cvv',
    PAN = 'pan',
}

export function getInstruments(): PaymentInstrument[] {
    return [
        {
            bigpayToken: '123',
            provider: 'braintree',
            iin: '11111111',
            last4: '4321',
            expiryMonth: '02',
            expiryYear: '2025',
            brand: 'visa',
            trustedShippingAddress: true,
            defaultInstrument: true,
            method: 'card',
            type: 'card',
            untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
        },
        {
            bigpayToken: '111',
            provider: 'authorizenet',
            iin: '11222333',
            last4: '4444',
            expiryMonth: '10',
            expiryYear: '2024',
            brand: 'american_express',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'card',
            type: 'card',
            untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
        },
        {
            bigpayToken: '31415',
            provider: 'authorizenet',
            externalId: 'test@external-id.com',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'paypal',
            type: 'account',
        },
        {
            bigpayToken: '4123',
            provider: 'authorizenet',
            externalId: 'test@external-id-2.com',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'paypal',
            type: 'account',
        },
        {
            bigpayToken: '12341234',
            provider: 'adyen',
            accountNumber: 'ABC',
            issuer: 'DEF',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'ideal',
            type: 'bank',
            iban: '12345',
        },
        {
            bigpayToken: '45454545',
            provider: 'adyen',
            accountNumber: 'GHI',
            issuer: 'JKL',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'ideal',
            type: 'bank',
            iban: '12345',
        },
        {
            bigpayToken: '34567456',
            provider: 'braintree',
            accountNumber: '0000',
            issuer: '011000015',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'ach',
            type: 'bank',
        },
        {
            bigpayToken: '12341414',
            provider: 'bluesnap',
            accountNumber: '0001',
            issuer: '011000016',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'ecp',
            type: 'bank',
        },
        {
            iban: 'undefined',
            bigpayToken: '12341414',
            provider: 'bluesnap',
            accountNumber: 'DE133123xx111',
            issuer: '011000017',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'sepa_direct_debit',
            type: 'bank',
        },
    ];
}

export function getCardInstrument(): CardInstrument {
    return {
        bigpayToken: '123',
        provider: 'braintree',
        iin: '11111111',
        last4: '4321',
        expiryMonth: '02',
        expiryYear: '2025',
        brand: 'test',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'card',
        type: 'card',
        untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.PAN,
    };
}

export function getAccountInstrument(): AccountInstrument {
    return {
        bigpayToken: '123',
        provider: 'braintree',
        externalId: 'test@external-id.com',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'paypal',
        type: 'account',
    };
}

export function getBankInstrument(): BankInstrument {
    return {
        bigpayToken: '454545',
        provider: 'adyen',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'ideal',
        type: 'bank',
        accountNumber: 'GHI',
        issuer: 'JKL',
        iban: '12345',
    };
}

export function getAchInstrument(): AchInstrument {
    return {
        bigpayToken: '45454545',
        provider: 'braintree',
        accountNumber: '0000',
        issuer: '011000015',
        trustedShippingAddress: false,
        defaultInstrument: false,
        method: 'ach',
        type: 'bank',
    };
}
