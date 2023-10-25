import {
    AccountInstrument,
    BankInstrument,
    CardInstrument,
    PaymentInstrument,
} from '@bigcommerce/checkout-sdk';

import { UntrustedShippingCardVerificationType } from './CardInstrumentFieldset';

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
            brand: 'american-express',
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
            externalId: 'test@external-id-3.com',
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
            externalId: 'test@external-id-4.com',
            trustedShippingAddress: false,
            defaultInstrument: false,
            method: 'ideal',
            type: 'bank',
            iban: '12345',
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
        externalId: 'test@external-id-3.com',
        trustedShippingAddress: true,
        defaultInstrument: true,
        method: 'ideal',
        type: 'bank',
        accountNumber: 'GHI',
        issuer: 'JKL',
        iban: '12345',
    };
}
