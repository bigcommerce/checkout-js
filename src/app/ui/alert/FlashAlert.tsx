import React, { memo, FunctionComponent } from 'react';

import Alert, { AlertType } from './Alert';

export interface FlashMessage {
    type: number;
    message: string;
}

export interface FlashAlertProps {
    testId?: string;
    message: FlashMessage;
}

const FlashAlert: FunctionComponent<FlashAlertProps> = ({
    message,
    testId,
}) => (
    <Alert
        testId={ testId }
        type={ mapAlertType(message.type) }
    >
        { message.message }
    </Alert>
);

function mapAlertType(type: number): AlertType | undefined {
    switch (type) {
    case 0:
        return AlertType.Error;

    case 1:
        return AlertType.Success;

    case 2:
        return AlertType.Info;

    case 3:
        return AlertType.Warning;
    }
}

export default memo(FlashAlert);
