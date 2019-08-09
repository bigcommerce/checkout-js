import { Instrument } from '@bigcommerce/checkout-sdk';

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
        },
    ];
}

export function getInstrument(): Instrument {
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
    };
}
