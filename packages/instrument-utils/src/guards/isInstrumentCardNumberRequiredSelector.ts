import {
    type CheckoutSelectors,
    type Instrument,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
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
