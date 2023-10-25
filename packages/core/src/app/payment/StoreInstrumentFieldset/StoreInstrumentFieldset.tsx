import React, { FunctionComponent } from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';


import { withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { Fieldset } from '../../ui/form';

import InstrumentStorageField from './InstrumentStorageField';
import InstrumentStoreAsDefaultField from './InstrumentStoreAsDefaultField';

interface StoreInstrumentFieldsetProps {
    isAccountInstrument?: boolean;
    instrumentId?: string;
}

interface WithStorageSettings {
    showSave: boolean;
    showSetAsDefault: boolean;
    setAsDefaultEnabled: boolean;
}

type WithFormValues = ConnectFormikProps<{ shouldSaveInstrument: boolean }>;

const StoreInstrumentFieldset: FunctionComponent<
    StoreInstrumentFieldsetProps & WithStorageSettings
> = ({ showSave, showSetAsDefault, isAccountInstrument = false, setAsDefaultEnabled }) => (
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

const mapToProps = (
    context: CheckoutContextProps,
    props: StoreInstrumentFieldsetProps & WithFormValues,
): WithStorageSettings | null => {
    const {
        checkoutState: {
            data: { getInstruments },
        },
    } = context;

    const allInstruments = getInstruments();

    const {
        formik: {
            values: { shouldSaveInstrument: saveIsChecked },
        },
        instrumentId,
    } = props;

    const addingNewInstrument = !instrumentId;
    const hasAnyOtherInstruments = !!allInstruments && allInstruments.length > 0;
    const instrument =
        allInstruments && allInstruments.find(({ bigpayToken }) => bigpayToken === instrumentId);

    return {
        ...props,
        showSave: addingNewInstrument,
        showSetAsDefault:
            (addingNewInstrument && hasAnyOtherInstruments) ||
            Boolean(instrument && !instrument.defaultInstrument),
        setAsDefaultEnabled: !addingNewInstrument || saveIsChecked,
    };
};

export default connectFormik(withCheckout(mapToProps)(StoreInstrumentFieldset));
