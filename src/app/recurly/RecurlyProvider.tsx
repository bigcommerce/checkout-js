import { Cart, Checkout, StoreConfig } from '@bigcommerce/checkout-sdk';
import { CustomerData, Elements, TokenPayload } from '@recurly/recurly-js';
import { noop } from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import cartHasSubscription from './cartHasSubscription';
import getUser from './getUser';
import { submitOrder } from './submitOrder';
import RecurlyContext, { RecurlyContextProps } from './RecurlyContext';

export interface RecurlyProviderProps {
    cart: Cart;
    checkout: Checkout;
    config: StoreConfig;
}

function RecurlyProvider({cart, checkout, config, ...rest}: RecurlyProviderProps) {
    const [recurlyState, setRecurlyState] = useState<RecurlyContextProps>({isLoadingRecurly: true, hasSubscription: false, isSubmitting: false, submitOrder: () => Promise.resolve(), resubmitRecurlyOrder: () => Promise.resolve()});
    const [recurlyToken, setRecurlyToken] = useState<TokenPayload | null>(null);
    useEffect(() => {
        if (cart && config?.storeProfile) {
            cartHasSubscription(cart, config.storeProfile.storeHash).then(hasSubscription => {
                setRecurlyState(state => {
                    return {...state, isLoadingRecurly: false, hasSubscription};
                });
            });
        }
    }, [cart, config]);
    useEffect(() => {
        if (cart?.customerId && config?.storeProfile) {
            getUser(config.storeProfile.storeHash).then(user => {
                console.log(user);
            });
        }

    }, [cart, config]);
    const resubmitRecurlyOrder = useCallback((customerInformation, secureToken) => {
        return new Promise((resolve, reject) => {
            if (recurlyToken) {
                submitOrder({
                    token: recurlyToken,
                    currency: checkout.cart.currency.code,
                    cartId: checkout.cart.id,
                    store: config.storeProfile.storeHash,
                    threeDSecureToken: secureToken,
                }).then(json => {
                    setRecurlyState(state => ({...state, isSubmitting: false}));
                    resolve(json);
                    window.location.replace(`checkout/order-confirmation/${json.orderId}`);

                }, e => {
                    setRecurlyState(state => ({...state, isSubmitting: false}));
                    reject(e);
                });
            } else {
                reject();
            }
        });

    }, [checkout, config, recurlyToken]);
    const submitRecurlyOrder = useCallback((elements, customerInformation) => {
        setRecurlyState(state => {
            return {...state, isSubmitting: true};
        });

        return new Promise((resolve, reject) => {
            recurly.token(elements, customerInformation, (err, token) => {
                if (err) {
                    console.log(err);
                    setRecurlyState(state => ({...state, isSubmitting: false}));
                    reject(err);
                } else {
                    setRecurlyToken(token);
                    submitOrder({
                        token,
                        currency: checkout.cart.currency.code,
                        cartId: checkout.cart.id,
                        store: config.storeProfile.storeHash,
                    }).then(json => {
                        setRecurlyState(state => ({...state, isSubmitting: false}));
                        window.location.replace(`checkout/order-confirmation/${json.orderId}`);

                    }, e => {
                        setRecurlyState(state => ({...state, isSubmitting: false}));
                        reject(e);
                    });
                }
            });
        });

    }, [checkout, config]);

    return <RecurlyContext.Provider value={ {...recurlyState, submitOrder: submitRecurlyOrder, resubmitRecurlyOrder} } { ...rest } />;
}

export default withCheckout(({ checkoutService, checkoutState }: CheckoutContextProps) => {
    const { data, errors, statuses } = checkoutState;

    return {cart: data.getCart(), checkout: data.getCheckout(), config: data.getConfig()};
})(RecurlyProvider);
