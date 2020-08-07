import React, { FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';

import InstrumentStorageField from './InstrumentStorageField';
import InstrumentStoreAsDefaultField from './InstrumentStoreAsDefaultField';

interface FormikValues {
    shouldSaveInstrument: boolean;
}

interface StoreInstrumentFieldsetProps extends ConnectFormikProps<FormikValues> {
    showSave: boolean;
    showSetAsDefault: boolean;
    isAccountInstrument: boolean;
}

const StoreInstrumentFieldset: FunctionComponent<StoreInstrumentFieldsetProps> = ({showSave, showSetAsDefault, isAccountInstrument, formik}) => {
    const { values: { shouldSaveInstrument: saveIsChecked } } = formik;
    const setAsDefaultEnabled = !showSave || saveIsChecked;

    return (
        <>
            {
                showSave &&
                <InstrumentStorageField
                    isAccountInstrument={ isAccountInstrument }
                />
            }
            {
                showSetAsDefault &&
                <InstrumentStoreAsDefaultField
                    disabled={ !setAsDefaultEnabled }
                    isAccountInstrument={ isAccountInstrument }
                />
            }
        </>
    );
};

export default connectFormik(StoreInstrumentFieldset);
