import { type CheckoutInitialState } from '@bigcommerce/checkout-sdk';
import { useEffect, useState } from 'react';

import { useExtensions } from '@bigcommerce/checkout/checkout-extension';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { yieldToMain } from '../../common/utility';

export const useLoadCheckout = (checkoutId: string, initialState?: CheckoutInitialState): {isLoadingCheckout: boolean} => {
    const { checkoutService, checkoutState: { data } } = useCheckout();
    const [ isLoadingCheckout, setIsLoadingCheckout ] = useState(!data.getCheckout());
    const { extensionService } = useExtensions();

    const fetchData = async () => {
        await Promise.all([
            checkoutService.loadCheckout(checkoutId, {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ] as any, // FIXME: Currently the enum is not exported so it can't be used here.
                },
            }),
            extensionService.loadExtensions(),
        ]);
    };

    const fetchDataWithRetry = async (maxRetries = 3): Promise<void> => {
        const attemptFetch = async (attemptSequence = 1): Promise<void> => {
            try {
                await fetchData();
            } catch {
                if (attemptSequence >= maxRetries) {
                    throw new Error('Failed to load checkout after 3 attempts, please try again.');
                }

                const delay = attemptSequence ** 2 * 1000;

                await new Promise(resolve => setTimeout(resolve, delay));

                await attemptFetch(attemptSequence + 1);
            }
        };

        await attemptFetch();
    };

    const hydrateInitialState = async (initialState: CheckoutInitialState) => {
        await yieldToMain();
        await checkoutService.hydrateInitialState(initialState);
        setIsLoadingCheckout(false);
    }

    useEffect(() => {
        if (!isLoadingCheckout) {
            return;
        }

        if (!initialState) {
            // If the initial data has not been preloaded from the server, we need to make API calls to fetch it.
            fetchDataWithRetry()
                .then(() => setIsLoadingCheckout(false))
                .catch((error) => {
                    throw error;
                });
        } else {
            hydrateInitialState(initialState);
        }
    }, []);

    return { isLoadingCheckout };
};
