import { useCapabilities } from '@bigcommerce/checkout/contexts';

import AddressType from './AddressType';

export const useRestrictManualAddressEntry = (type: AddressType): boolean => {
    const {
        shipping: { restrictManualAddressEntry: restrictManualAddressEntryForShipping },
        billing: { restrictManualAddressEntry: restrictManualAddressEntryForBilling },
    } = useCapabilities();

    return type === AddressType.Shipping
        ? restrictManualAddressEntryForShipping
        : restrictManualAddressEntryForBilling;
};
