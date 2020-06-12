import React, { useState, FC } from 'react';

import CreditCardStorageField from './CreditCardStorageField';
import CreditCardStoreAsDefaultField from './CreditCardStoreAsDefaultField';

const StoreCreditCardFieldset: FC<{showSetAsDefault: boolean}> = ({showSetAsDefault}) => {
    const [saveIsChecked, setSaveIsChecked] = useState(false);
    const trackSaveCheckedStatus = (isChecked: boolean) => {
        setSaveIsChecked(isChecked);
    };

    return (
        <>
            <CreditCardStorageField name="shouldSaveInstrument" onChange={ trackSaveCheckedStatus } />
            { showSetAsDefault && <CreditCardStoreAsDefaultField disabled={ !saveIsChecked } name="shouldSetAsDefaultInstrument" /> }
        </>
    );
};

export default StoreCreditCardFieldset;
