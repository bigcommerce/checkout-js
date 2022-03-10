import { Cart } from '@bigcommerce/checkout-sdk';
import React, { useContext, useEffect, useState } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';

import cartHasSubscription from './cartHasSubscription';
import RecurlyContext, { RecurlyContextProps } from './RecurlyContext';

export interface RecurlyProviderProps {
    cart: Cart;
}

function RecurlyProvider({cart, ...rest}: RecurlyProviderProps) {
    const [recurlyState, setRecurlyState] = useState<RecurlyContextProps>({isLoadingRecurly: true, hasSubscription: false});
    useEffect(() => {
        if (cart) {
            cartHasSubscription(cart).then(hasSubscription => {
                setRecurlyState({isLoadingRecurly: false, hasSubscription});
            });
        }
    }, [cart]);

    return <RecurlyContext.Provider value={ recurlyState } { ...rest } />;
}

export default withCheckout(({ checkoutService, checkoutState }: CheckoutContextProps) => {
    const { data, errors, statuses } = checkoutState;

    return {cart: data.getCart()};
})(RecurlyProvider);
