import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

/**
 * The currency the shopper can pay in at checkout, at PayPal's FX rate (PAYPAL-7373).
 * Sent by BCP in `initializationData.shopperCurrencyOffer`. The cart stays in the store
 * currency; only the PayPal order is charged in this currency.
 */
export interface ShopperCurrencyOffer {
    currency: string;
    exchangeRate: string;
    fxId: string;
    expiryTime: string;
    countryCode: string;
    // The shopper pays in this currency
    isSelected: boolean;
    // The shopper chose a currency for the cart (this one or the cart's)
    hasShopperChoice: boolean;
}

function isShopperCurrencyOffer(offer: unknown): offer is ShopperCurrencyOffer {
    return (
        typeof offer === 'object' &&
        offer !== null &&
        'currency' in offer &&
        typeof offer.currency === 'string' &&
        'exchangeRate' in offer &&
        typeof offer.exchangeRate === 'string'
    );
}

export function getShopperCurrencyOffer(method: PaymentMethod): ShopperCurrencyOffer | undefined {
    const offer: unknown = method.initializationData?.shopperCurrencyOffer;

    return isShopperCurrencyOffer(offer) ? offer : undefined;
}

function getFractionDigits(currency: string): number {
    return (
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions()
            .maximumFractionDigits ?? 2
    );
}

/**
 * The amount in the shopper's currency: the same half-up rounding to the currency's minor unit
 * BigPay uses for the PayPal order.
 */
export function convertAmount(amount: number, exchangeRate: string, currency: string): number {
    const factor = 10 ** getFractionDigits(currency);

    return Math.round(amount * Number(exchangeRate) * factor + Number.EPSILON) / factor;
}

export function formatMoney(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
    }).format(amount);
}

export function formatRate(exchangeRate: string): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(
        Number(exchangeRate),
    );
}

export function getCountryName(countryCode: string): string {
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ?? countryCode;
    } catch {
        return countryCode;
    }
}
