import { Cart } from '@bigcommerce/checkout-sdk';

/**
 * Minimum charge amounts due to the Stripe documentation
 * https://stripe.com/docs/currencies#minimum-and-maximum-charge-amounts
 */
enum stripeLinkMinAmount {
    'USD' = 0.5,
    'AED' = 2,
    'AUD' = 0.5,
    'BGN' = 1,
    'BRL' = 0.5,
    'CAD' = 0.5,
    'CHF' = 0.5,
    'CZK' = 15,
    'DKK' = 2.5,
    'EUR' = 0.5,
    'GBP' = 0.3,
    'HKD' = 4,
    'HUF' = 175,
    'INR' = 0.5,
    'JPY' = 50,
    'MXN' = 10,
    'MYR' = 2,
    'NOK' = 3,
    'NZD' = 0.5,
    'PLN' = 2,
    'RON' = 2,
    'SEK' = 3,
    'SGD' = 0.5,
    'THB' = 10,
}

const isStripeLinkMinAmount = (code: string): code is keyof typeof stripeLinkMinAmount => {
    return code in stripeLinkMinAmount;
};

const shouldUseStripeLinkByMinimumAmount = (cart: Cart) => {
    const {
        currency: { code },
        cartAmount,
    } = cart;

    if (isStripeLinkMinAmount(code) && cartAmount >= stripeLinkMinAmount[code]) {
        return true;
    }

    return false;
};

export default shouldUseStripeLinkByMinimumAmount;
