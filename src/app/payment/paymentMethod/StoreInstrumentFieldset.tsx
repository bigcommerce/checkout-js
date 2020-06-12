
import React, { useState, FC } from 'react';

import { CreditCardStorageField, CreditCardStoreAsDefaultField } from '../creditCard';
import {  AccountInstrumentStorageField, AccountInstrumentStoreAsDefaultField } from '../storedInstrument';

interface StoreInstrumentFieldsetProps {
    showSave: boolean;
    showSetAsDefault: boolean;
    isAccountInstrument: boolean;
}

const StoreInstrumentFieldset: FC<StoreInstrumentFieldsetProps> = ({showSave, showSetAsDefault, isAccountInstrument}) => {
    const StorageField = isAccountInstrument ? AccountInstrumentStorageField : CreditCardStorageField;
    const StoreAsDefaultField = isAccountInstrument ? AccountInstrumentStoreAsDefaultField : CreditCardStoreAsDefaultField;
    const [saveIsChecked, setSaveIsChecked] = useState(false);
    const setAsDefaultEnabled = !showSave || saveIsChecked;
    const trackSaveCheckedStatus = (isChecked: boolean) => {
        setSaveIsChecked(isChecked);
    };

    return (
        <>
            { showSave && <StorageField name="shouldSaveInstrument" onChange={ trackSaveCheckedStatus } /> }
            { showSetAsDefault && <StoreAsDefaultField disabled={ !setAsDefaultEnabled } name="shouldSetAsDefaultInstrument" /> }
        </>
    );
};

export default StoreInstrumentFieldset;
