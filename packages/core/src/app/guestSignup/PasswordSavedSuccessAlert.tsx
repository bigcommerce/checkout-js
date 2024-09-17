import React, { FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Alert, AlertType } from '../ui/alert';

const PasswordSavedSuccessAlert: FunctionComponent = () => (
    <Alert type={AlertType.Success}>
        <strong>
            <TranslatedString id="customer.set_password_success" />
        </strong>
    </Alert>
);

export default PasswordSavedSuccessAlert;
