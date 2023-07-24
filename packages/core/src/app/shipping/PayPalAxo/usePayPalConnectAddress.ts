import { Address } from '@bigcommerce/checkout-sdk';

const usePayPalConnectAddress = () => {

    const isPayPalConnectAddress = (address: Address): boolean => {
        return true;
    };

    const isPoweredByPayPalConnect = (): boolean => {
        return true;
    };

    return {
        isPayPalConnectAddress
    };
};

export default usePayPalConnectAddress;
