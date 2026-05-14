import { useCallback } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

export interface PoConfig {
    enabled: boolean;
    label: string;
    required: boolean;
}

const usePoConfig = () => {
    const { checkoutService, checkoutState } = useCheckout();

    const fetchPoConfig = useCallback(
        () => checkoutService.loadPoConfig(),
        [checkoutService],
    );

    return {
        poConfig: checkoutState.data.getPoConfig() as PoConfig | undefined,
        isLoading: checkoutState.statuses.isLoadingPoConfig(),
        loadError: checkoutState.errors.getLoadPoConfigError(),
        fetchPoConfig,
    };
};

export default usePoConfig;
