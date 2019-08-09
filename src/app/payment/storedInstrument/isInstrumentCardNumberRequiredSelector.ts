import { CheckoutSelectors, Instrument } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import isInstrumentCardNumberRequired from './isInstrumentCardNumberRequired';

const isInstrumentCardNumberRequiredSelector = createSelector(
    ({ data }: CheckoutSelectors) => data.getConfig(),
    ({ data }: CheckoutSelectors) => {
        const cart = data.getCart();

        return cart && cart.lineItems;
    },
    (config, lineItems) => (instrument: Instrument) => {
        if (!config || !lineItems) {
            return false;
        }

        return isInstrumentCardNumberRequired({
            config,
            lineItems,
            instrument,
        });
    }
);

export default isInstrumentCardNumberRequiredSelector;
