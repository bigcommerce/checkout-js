import { PaymentInstrument } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import {
    PaymentFormService,
    usePaymentFormContext,
} from '@bigcommerce/checkout/payment-integration-api';
import { Fieldset } from '@bigcommerce/checkout/ui';

import { InstrumentStorageField } from '../InstrumentStorageField';
import { InstrumentStoreAsDefaultField } from '../InstrumentStoreAsDefaultField';

interface StoreInstrumentFieldsetProps {
    isAccountInstrument?: boolean;
    instrumentId?: string;
    instruments: PaymentInstrument[];
}

interface WithStorageSettings {
    showSave: boolean;
    showSetAsDefault: boolean;
    setAsDefaultEnabled: boolean;
}

const useProps = (
    props: StoreInstrumentFieldsetProps,
    paymentForm: PaymentFormService,
): WithStorageSettings => {
    const saveIsChecked = Boolean(paymentForm.getFieldValue<boolean>('shouldSaveInstrument'));

    const { instrumentId, instruments } = props;

    const addingNewInstrument = !instrumentId;
    const hasAnyOtherInstruments = !!instruments && instruments.length > 0;
    const instrument =
        instruments && instruments.find(({ bigpayToken }) => bigpayToken === instrumentId);

    return {
        ...props,
        showSave: addingNewInstrument,
        showSetAsDefault:
            (addingNewInstrument && hasAnyOtherInstruments) ||
            Boolean(instrument && !instrument.defaultInstrument),
        setAsDefaultEnabled: !addingNewInstrument || saveIsChecked,
    };
};

const StoreInstrumentFieldset: FunctionComponent<StoreInstrumentFieldsetProps> = ({
    isAccountInstrument = false,
    ...props
}) => {
    const { paymentForm } = usePaymentFormContext();

    const { showSave, showSetAsDefault, setAsDefaultEnabled } = useProps(props, paymentForm);

    return (
        <Fieldset>
            {showSave && <InstrumentStorageField isAccountInstrument={isAccountInstrument} />}

            {showSetAsDefault && (
                <InstrumentStoreAsDefaultField
                    disabled={!setAsDefaultEnabled}
                    isAccountInstrument={isAccountInstrument}
                />
            )}
        </Fieldset>
    );
};

export default StoreInstrumentFieldset;
