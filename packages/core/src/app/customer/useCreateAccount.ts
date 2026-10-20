import { useCallback } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';

type B2BWindow = Window & {
    b2b?: { utils?: { openPage?(path: string): void } };
};

export const useCreateAccount = (onFallback: () => void): (() => void) => {
    const {
        customer: { createAccountViaBuyerPortal },
    } = useCapabilities();

    return useCallback(() => {
        const { utils } = (window as B2BWindow).b2b ?? {};

        if (createAccountViaBuyerPortal && utils?.openPage) {
            utils.openPage('/register');
        } else {
            onFallback();
        }
    }, [createAccountViaBuyerPortal, onFallback]);
};
