import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

// Clear all B2B sessionStorage after a successful order.
export const clearB2BMetadataStorage = (): void => {
    B2BSessionStorage.clearAll();
};
