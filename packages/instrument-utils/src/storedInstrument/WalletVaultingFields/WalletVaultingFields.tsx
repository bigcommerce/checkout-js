import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { Fieldset } from '@bigcommerce/checkout/ui';

import { canVaultWalletInstrument, isPaymentMethodAutoVaultingInstruments } from '../../guards';
import { AutoVaultingDisclaimer } from '../AutoVaultingDisclaimer';
import { InstrumentStorageField } from '../InstrumentStorageField';

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
            {canVaultWalletInstrument({ customer, method }) && (
                <Fieldset additionalClassName="form-fieldset--storedInstrument">
                    <InstrumentStorageField isAccountInstrument={false} />
                </Fieldset>
            )}

            {isPaymentMethodAutoVaultingInstruments(method) && <AutoVaultingDisclaimer />}
        </>
    );
};
