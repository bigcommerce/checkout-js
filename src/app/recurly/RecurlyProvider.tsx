import { Cart, Checkout, StoreConfig } from '@bigcommerce/checkout-sdk';
import { CustomerData, Elements } from '@recurly/recurly-js';
import { noop } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import cartHasSubscription from './cartHasSubscription';
import { submitOrder } from './submitOrder';
import RecurlyContext, { RecurlyContextProps } from './RecurlyContext';

export interface RecurlyProviderProps {
    cart: Cart;
    checkout: Checkout;
    config: StoreConfig;
}

function RecurlyProvider({cart, checkout, config, ...rest}: RecurlyProviderProps) {
    const [recurlyState, setRecurlyState] = useState<RecurlyContextProps>({isLoadingRecurly: true, hasSubscription: false, isSubmitting: false, submitOrder: noop});
    useEffect(() => {
        if (cart) {
            cartHasSubscription(cart).then(hasSubscription => {
                setRecurlyState(state => {
                    return {...state, isLoadingRecurly: false, hasSubscription};
                });
            });
        }
    }, [cart]);
    const submitRecurlyOrder = useCallback((elements, customerInformation) => {
        setRecurlyState(state => {
            return {...state, isSubmitting: true};
        });
        recurly.token(elements, customerInformation, (err, token) => {
            if (err) {
                console.error(err);
            } else {
                console.log(token);
                submitOrder({
                    token,
                    currency: checkout.cart.currency.code,
                    cartId: checkout.cart.id,
                    store: config.storeProfile.storeHash,
                }).then(json => {
                    setRecurlyState(state => ({...state, isSubmitting: false}));
                    window.location.replace(`checkout/order-confirmation/${json.orderId}`);

                });
            }
        });
    }, [checkout, config]);

    return <RecurlyContext.Provider value={ {...recurlyState, submitOrder: submitRecurlyOrder} } { ...rest } />;
}

export default withCheckout(({ checkoutService, checkoutState }: CheckoutContextProps) => {
    const { data, errors, statuses } = checkoutState;

    return {cart: data.getCart(), checkout: data.getCheckout(), config: data.getConfig()};
})(RecurlyProvider);
