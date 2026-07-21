import { type Address } from '@bigcommerce/checkout-sdk';
import { useCallback } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';

import { decodeAddressLabel } from './addressLabelUtils';

export default function useAddressLabelDecoder(): <T extends Address | undefined>(address: T) => T {
    const {
        userJourney: { hasAddressLabel },
    } = useCapabilities();
    const { selectedState: cart } = useCheckout(({ data }) => data.getCart());
    const cartCompanyName = cart?.companyName ?? '';

    return useCallback(
        <T extends Address | undefined>(address: T): T =>
            hasAddressLabel && address ? decodeAddressLabel(address, cartCompanyName) : address,
        [hasAddressLabel, cartCompanyName],
    );
}
