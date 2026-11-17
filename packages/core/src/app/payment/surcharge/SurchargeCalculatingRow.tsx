import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { useSurchargeState } from './surchargeState';

// The "Surcharge  Calculating..." row of the order summary, shown while the backend works on the
// surcharge and the checkout does not carry the fee yet. Only a placeholder: it adds nothing to the
// total, the real fee comes with the reloaded checkout. Same markup as a price row, so it picks up the
// surcharge highlight.
export const SurchargeCalculatingRow: FunctionComponent = () => {
    const surcharge = useSurchargeState();

    if (surcharge.status !== 'calculating') {
        return null;
    }

    return (
        <div data-test="cart-surcharge-calculating">
            <div
                aria-busy="true"
                aria-live="polite"
                className={classNames(
                    'cart-priceItem',
                    'cart-priceItem--surcharge',
                    'cart-priceItem--surchargeCalculating',
                    'optimizedCheckout-contentPrimary',
                )}
            >
                <span className="cart-priceItem-label body-regular">
                    <span data-test="cart-price-label">
                        <TranslatedString id="payment.surcharge_fee_name" />
                        {'  '}
                    </span>
                </span>
                <span className="cart-priceItem-value body-medium">
                    <span data-test="cart-price-value">
                        <TranslatedString id="payment.surcharge_calculating_value" />
                    </span>
                </span>
            </div>
        </div>
    );
};
