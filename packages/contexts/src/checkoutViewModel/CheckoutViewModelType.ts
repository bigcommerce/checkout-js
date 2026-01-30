import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

export enum CheckoutViewModelType {
    B2B = 'B2B',
    B2C = 'B2C',
}

export interface CheckoutViewModel {
    type: CheckoutViewModelType;
    capabilities: {
        canSearchAddresses: boolean;
        lockShipping: boolean;
    };
    data: {
        addressBook: CustomerAddress[];
    };
}
