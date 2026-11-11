import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import {
    convertAmount,
    formatMoney,
    formatRate,
    getCountryName,
    getShopperCurrencyOffer,
} from './shopperCurrency';

import './BigCommercePaymentsShopperCurrency.scss';

// Reload the rate a minute before PayPal's quote expires
const RATE_REFRESH_LEAD_TIME_MS = 60 * 1000;

/**
 * PoC for BCP adaptive pricing (PAYPAL-7373): the choice between paying in the shopper's
 * currency at PayPal's FX rate and paying in the store currency, above the payment methods.
 * Shopper-facing text is a placeholder until Legal confirms the disclosure (LEG-23418).
 */
const BigCommercePaymentsShopperCurrency: FunctionComponent<{ method: PaymentMethod }> = ({
    method,
}) => {
    const { checkoutService, checkoutState } = useCheckout();
    const [isLoading, setIsLoading] = useState(false);
    const isPreselectedRef = useRef(false);

    const offer = getShopperCurrencyOffer(method);
    const cart = checkoutState.data.getCart();
    const checkout = checkoutState.data.getCheckout();
    const cartCurrency = cart?.currency.code;

    // The choice is kept for the cart: the checkout loads the payment methods with it once,
    // and BigPay charges the cart's PayPal order in the chosen currency.
    const choose = useCallback(
        async (currency: string, fxId?: string) => {
            setIsLoading(true);

            try {
                await checkoutService.loadPaymentMethods({
                    params: { presentmentCurrency: currency, ...(fxId ? { fxId } : {}) },
                });
            } finally {
                setIsLoading(false);
            }
        },
        [checkoutService],
    );

    // The shopper's currency is preselected, as in Stripe Adaptive Pricing (Legal to confirm).
    useEffect(() => {
        if (!offer || offer.hasShopperChoice || isPreselectedRef.current) {
            return;
        }

        isPreselectedRef.current = true;
        void choose(offer.currency, offer.fxId);
    }, [offer, choose]);

    // PayPal refreshes rates daily: get the new rate before the quote expires.
    useEffect(() => {
        if (!offer || !cartCurrency) {
            return;
        }

        const delay = Date.parse(offer.expiryTime) - Date.now() - RATE_REFRESH_LEAD_TIME_MS;

        if (Number.isNaN(delay)) {
            return;
        }

        const timer = setTimeout(
            () => {
                void choose(offer.isSelected ? offer.currency : cartCurrency);
            },
            Math.max(delay, 0),
        );

        return () => clearTimeout(timer);
    }, [offer, cartCurrency, choose]);

    if (!offer || !cartCurrency || !checkout) {
        return null;
    }

    const cartAmount = checkout.outstandingBalance;
    const shopperAmount = convertAmount(cartAmount, offer.exchangeRate, offer.currency);
    const isShopperCurrencySelected = offer.isSelected;

    const renderOption = (
        currency: string,
        amount: number,
        isSelected: boolean,
        onSelect: () => void,
    ) => (
        <button
            aria-pressed={isSelected}
            className={classNames(
                'bcp-shopper-currency-option',
                'optimizedCheckout-form-checklist-item',
                {
                    'bcp-shopper-currency-option--selected': isSelected,
                },
            )}
            data-test={`bcp-shopper-currency-option-${currency}`}
            disabled={isLoading}
            onClick={isSelected ? undefined : onSelect}
            type="button"
        >
            <span className="bcp-shopper-currency-code optimizedCheckout-contentPrimary">
                {currency}
            </span>
            <span className="bcp-shopper-currency-amount optimizedCheckout-contentPrimary">
                {formatMoney(amount, currency)}
            </span>
        </button>
    );

    return (
        <div className="bcp-shopper-currency" data-test="bcp-shopper-currency">
            <div className="bcp-shopper-currency-options">
                {renderOption(offer.currency, shopperAmount, isShopperCurrencySelected, () => {
                    void choose(offer.currency, offer.fxId);
                })}
                {renderOption(cartCurrency, cartAmount, !isShopperCurrencySelected, () => {
                    void choose(cartCurrency);
                })}
            </div>
            <div className="bcp-shopper-currency-details optimizedCheckout-contentSecondary">
                <p>
                    1 {cartCurrency} = {formatRate(offer.exchangeRate)} {offer.currency}, including
                    PayPal&apos;s conversion fee.
                </p>
                <p>Based on your address in {getCountryName(offer.countryCode)}.</p>
                {isShopperCurrencySelected && (
                    <p className="bcp-shopper-currency-other-methods">
                        More payment options are available when you pay in {cartCurrency}.{' '}
                        <button
                            className="bcp-shopper-currency-pay-in-cart-currency"
                            data-test="bcp-shopper-currency-pay-in-cart-currency"
                            disabled={isLoading}
                            onClick={() => {
                                void choose(cartCurrency);
                            }}
                            type="button"
                        >
                            Pay in {cartCurrency}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default BigCommercePaymentsShopperCurrency;
