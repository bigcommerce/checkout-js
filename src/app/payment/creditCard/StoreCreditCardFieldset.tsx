import React, { memo, FunctionComponent } from 'react';

import { connectFormik, ConnectFormikProps } from '../../common/form';

import CreditCardStorageField from './CreditCardStorageField';
import CreditCardStoreAsDefaultField from './CreditCardStoreAsDefaultField';

interface FormikValues {
    shouldSaveInstrument: boolean;
}
interface StoreCreditCardFieldsetProps extends ConnectFormikProps<FormikValues> {
    shouldShowSetAsDefault: boolean;
}

const StoreCreditCardFieldset: FunctionComponent<StoreCreditCardFieldsetProps> = ({ shouldShowSetAsDefault, formik }) => {
    const { values: { shouldSaveInstrument: saveIsChecked } } = formik;

    return <>
        <CreditCardStorageField
            name="shouldSaveInstrument"
        />
        {
            shouldShowSetAsDefault &&
            <CreditCardStoreAsDefaultField
                disabled={ !saveIsChecked }
                name="shouldSetAsDefaultInstrument"
            />
        }
    </>;
};

export default connectFormik(memo(StoreCreditCardFieldset));
