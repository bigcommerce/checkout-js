import { type Customer, type PaymentMethod } from '@bigcommerce/checkout-sdk';

export interface CanVaultGooglePayInstrumentState {
    customer?: Customer;
    method: PaymentMethod;
}

export const canVaultGooglePayInstrument = ({
    customer,
    method,
}: CanVaultGooglePayInstrumentState): boolean =>
    Boolean(method.config.vaultingWalletEnabled) && Boolean(customer && !customer.isGuest);

export const isWalletAutoVaultingEnabled = (method: PaymentMethod): boolean =>
    Boolean(method.config.vaultInstrumentForAllWalletPayments);
