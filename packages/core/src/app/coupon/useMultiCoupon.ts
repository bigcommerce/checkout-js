import { useCheckout } from '@bigcommerce/checkout/contexts';

interface UseMultiCouponValues {
    isCouponCodeCollapsed: boolean;
}

export const useMultiCoupon = (): UseMultiCouponValues => {
    const { checkoutState } = useCheckout();
    const config = checkoutState.data.getConfig();

    if(!config) {
        throw new Error('Checkout configuration is not available');
    }

    const isCouponCodeCollapsed = config.checkoutSettings.isCouponCodeCollapsed;

    return {
        isCouponCodeCollapsed,
    }
}
