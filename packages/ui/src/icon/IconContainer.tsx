import classNames from 'classnames';
import React, { type FunctionComponent, memo } from 'react';

export enum IconSize {
    Regular = 'regular',
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export interface IconProps {
    additionalClassName?: string;
    size?: IconSize;
    testId?: string;
}

const IconContainer: FunctionComponent<IconProps & { children: React.ReactNode }> = memo(
    ({ additionalClassName, size, testId, children }) => (
        <div
            className={classNames(
                'icon',
                additionalClassName,
                size === IconSize.Small ? 'icon--small' : null,
                size === IconSize.Large ? 'icon--large' : null,
                size === IconSize.Medium ? 'icon--medium' : null,
            )}
            data-test={testId}
        >
            {children}
        </div>
    ),
);

export default IconContainer;
