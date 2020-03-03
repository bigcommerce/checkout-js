import { AccountInstrument, CardInstrument, PaymentInstrument } from '@bigcommerce/checkout-sdk';

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
