import { AccountInstrument, CardInstrument, Instrument } from '@bigcommerce/checkout-sdk';

export function getInstruments(): Instrument[] {
    return [
        {
            bigpayToken: '123',
            provider: 'braintree',
            iin: '11111111',
            last4: '4321',
            expiryMonth: '02',
            expiryYear: '2020',
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
    ];
}

export function getCardInstrument(): CardInstrument {
    return {
        bigpayToken: '123',
        provider: 'braintree',
        iin: '11111111',
        last4: '4321',
        expiryMonth: '02',
        expiryYear: '2020',
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
