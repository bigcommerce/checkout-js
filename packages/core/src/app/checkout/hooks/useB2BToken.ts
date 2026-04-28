import { useCallback } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

const useB2BToken = () => {
    const { checkoutService, checkoutState } = useCheckout();

    const fetchB2BToken = useCallback(
        () => checkoutService.getB2BToken(),
        [checkoutService],
    );

    return {
        b2bToken: checkoutState.data.getB2BToken(),
        isLoading: checkoutState.statuses.isLoadingB2BToken(),
        loadError: checkoutState.errors.getLoadB2BTokenError(),
        fetchB2BToken,
    };
};

export default useB2BToken;
