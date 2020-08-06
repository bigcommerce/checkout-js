import React, { useState, FunctionComponent } from 'react';

import CreditCardStorageField from './CreditCardStorageField';
import CreditCardStoreAsDefaultField from './CreditCardStoreAsDefaultField';

const StoreCreditCardFieldset: FunctionComponent<{ shouldShowSetAsDefault: boolean }> = ({ shouldShowSetAsDefault }) => {
    const [saveIsChecked, setSaveIsChecked] = useState(false);
    const trackSaveCheckedStatus = (isChecked: boolean) => {
        setSaveIsChecked(isChecked);
    };

    return (
        <>
            <CreditCardStorageField
                name="shouldSaveInstrument"
                onChange={ trackSaveCheckedStatus }
            />
            {
                shouldShowSetAsDefault &&
                <CreditCardStoreAsDefaultField
                    disabled={ !saveIsChecked }
                    name="shouldSetAsDefaultInstrument"
                />
            }
        </>
    );
};

export default StoreCreditCardFieldset;
