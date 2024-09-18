import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Alert, AlertType } from '@bigcommerce/checkout/ui';

export interface ManageInstrumentsAlertProps {
    error: any; // TODO: Fix typing
}

const ManageInstrumentsAlert: FunctionComponent<ManageInstrumentsAlertProps> = ({ error }) => {
    const { status } = error;

    if (status === 401) {
        return (
            <Alert type={AlertType.Error}>
                <TranslatedString id="payment.instrument_manage_delete_auth_error" />
            </Alert>
        );
    }

    if (status >= 400 && status < 500) {
        return (
            <Alert type={AlertType.Error}>
                <TranslatedString id="payment.instrument_manage_delete_client_error" />
            </Alert>
        );
    }

    return (
        <Alert type={AlertType.Error}>
            <TranslatedString id="payment.instrument_manage_delete_server_error" />
        </Alert>
    );
};

export default memo(ManageInstrumentsAlert);
