import { CheckoutSelectors, Instrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import isInstrumentCardNumberRequired from './isInstrumentCardNumberRequired/isInstrumentCardNumberRequired';

const isInstrumentCardNumberRequiredSelector = createSelector(
    ({ data }: CheckoutSelectors) => {
        const cart = data.getCart();

        return cart && cart.lineItems;
    },
    (lineItems) => (instrument: Instrument, paymentMethod?: PaymentMethod) => {
        if (!lineItems) {
            return false;
        }

        return isInstrumentCardNumberRequired({
            lineItems,
            instrument,
            paymentMethod,
        });
    },
);

export default isInstrumentCardNumberRequiredSelector;
