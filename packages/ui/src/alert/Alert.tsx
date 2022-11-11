import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';

import { IconError, IconInfo, IconSuccess } from '../icon';

export interface AlertProps {
    additionalClassName?: string;
    icon?: ReactNode;
    testId?: string;
    type?: AlertType;
}

export enum AlertType {
    Error = 'error',
    Info = 'info',
    Success = 'success',
    Warning = 'warning',
}

function renderDefaultIcon(type?: AlertType): ReactNode {
    switch (type) {
        case AlertType.Error:
        case AlertType.Warning:
            return <IconError />;

        case AlertType.Success:
            return <IconSuccess />;

        case AlertType.Info:
        default:
            return <IconInfo />;
    }
}

const Alert: FunctionComponent<AlertProps> = ({
    additionalClassName,
    children,
    icon,
    testId,
    type,
}) => (
    <div
        className={classNames(
            'alertBox',
            additionalClassName,
            { 'alertBox--info': type === AlertType.Info || !type },
            { 'alertBox--error': type === AlertType.Error },
            { 'alertBox--success': type === AlertType.Success },
            { 'alertBox--warning': type === AlertType.Warning },
        )}
        data-test={testId}
    >
        <div className="alertBox-column alertBox-icon">{icon || renderDefaultIcon(type)}</div>

        <div aria-live="assertive" className="alertBox-column alertBox-message" role="alert">
            {children}
        </div>
    </div>
);

export default Alert;
