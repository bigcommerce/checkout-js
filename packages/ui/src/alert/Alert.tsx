import classNames from 'classnames';
import React, { type FunctionComponent, type ReactNode, useId } from 'react';

import { IconError, IconInfo, IconSuccess } from '../icon';

export interface AlertProps {
    additionalClassName?: string;
    icon?: ReactNode;
    testId?: string;
    type?: AlertType;
    children?: ReactNode;
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
}) => {
    const describedBy = useId();

    return (
        <div
            aria-describedby={describedBy}
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

            <div
                aria-live={type === AlertType.Error ? 'assertive' : 'polite'}
                className="alertBox-column alertBox-message"
                id={describedBy}
                role={type === AlertType.Error ? 'alert' : 'status'}
            >
                {children}
            </div>
        </div>
    );
};

export default Alert;
