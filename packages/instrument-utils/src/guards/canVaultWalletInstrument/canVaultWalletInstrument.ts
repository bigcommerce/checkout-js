import { type Customer, type PaymentMethod } from '@bigcommerce/checkout-sdk';

export interface CanVaultWalletInstrumentState {
    customer?: Customer;
    method: PaymentMethod;
}

export const canVaultWalletInstrument = ({
    customer,
    method,
}: CanVaultWalletInstrumentState): boolean =>
    Boolean(method.config.isVaultingEnabled) && Boolean(customer && !customer.isGuest);
