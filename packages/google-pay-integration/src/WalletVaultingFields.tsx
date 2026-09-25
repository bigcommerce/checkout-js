import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import {
    AutoVaultingDisclaimer,
    InstrumentStorageField,
} from '@bigcommerce/checkout/instrument-utils';
import { Fieldset } from '@bigcommerce/checkout/ui';

import {
    canVaultGooglePayInstrument,
    isWalletAutoVaultingEnabled,
} from './canVaultGooglePayInstrument';

export interface WalletVaultingFieldsProps {
    method: PaymentMethod;
}

export const WalletVaultingFields: FunctionComponent<WalletVaultingFieldsProps> = ({ method }) => {
    const {
        selectedState: { customer },
    } = useCheckout(({ data }) => ({
        customer: data.getCustomer(),
    }));

    return (
        <>
            {canVaultGooglePayInstrument({ customer, method }) && (
                <Fieldset additionalClassName="form-fieldset--storedInstrument">
                    <InstrumentStorageField isAccountInstrument={false} />
                </Fieldset>
            )}

            {isWalletAutoVaultingEnabled(method) && <AutoVaultingDisclaimer />}
        </>
    );
};
