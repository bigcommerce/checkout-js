import { CheckoutSelectors, Instrument } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import isInstrumentCardNumberRequired from './isInstrumentCardNumberRequired/isInstrumentCardNumberRequired';

const isInstrumentCardNumberRequiredSelector = createSelector(
    ({ data }: CheckoutSelectors) => {
        const cart = data.getCart();

        return cart && cart.lineItems;
    },
    (lineItems) => (instrument: Instrument) => {
        if (!lineItems) {
            return false;
        }

        return isInstrumentCardNumberRequired({
            lineItems,
            instrument,
        });
    },
);

export default isInstrumentCardNumberRequiredSelector;
