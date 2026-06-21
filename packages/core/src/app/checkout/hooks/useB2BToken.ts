import { useCallback } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

const useB2BToken = () => {
    const {
        checkoutService,
        selectedState: { b2bToken, isLoadingB2BToken, loadB2BTokenError },
    } = useCheckout(({ data, statuses, errors }) => ({
        b2bToken: data.getB2BToken(),
        isLoadingB2BToken: statuses.isLoadingB2BToken(),
        loadB2BTokenError: errors.getLoadB2BTokenError(),
    }));

    const fetchB2BToken = useCallback(() => checkoutService.getB2BToken(), [checkoutService]);

    return {
        b2bToken,
        isLoading: isLoadingB2BToken,
        loadError: loadB2BTokenError,
        fetchB2BToken,
    };
};

export default useB2BToken;
