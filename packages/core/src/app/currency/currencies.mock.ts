import { Currency } from '@bigcommerce/checkout-sdk';

export function getCurrency(): Currency {
    return {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimalPlaces: 2,
    };
}
