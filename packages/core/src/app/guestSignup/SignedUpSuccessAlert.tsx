import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';


const SignedUpSuccessAlert: FunctionComponent = () => (
    <Alert type={AlertType.Success}>
        <strong>
            <TranslatedString id="customer.create_account_success" />
        </strong>
    </Alert>
);

export default SignedUpSuccessAlert;
