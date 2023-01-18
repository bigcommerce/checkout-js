import { CheckoutSelectors, Instrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { createSelector } from 'reselect';

import isInstrumentCardCodeRequired from './isInstrumentCardCodeRequired/isInstrumentCardCodeRequired';

const isInstrumentCardCodeRequiredSelector = createSelector(
    ({ data }: CheckoutSelectors) => {
        const cart = data.getCart();

        return cart && cart.lineItems;
    },
    (lineItems) => (instrument: Instrument, method: PaymentMethod) => {
        if (!lineItems) {
            return false;
        }

        return isInstrumentCardCodeRequired({
            instrument,
            lineItems,
            paymentMethod: method,
        });
    },
);

export default isInstrumentCardCodeRequiredSelector;
