import classNames from 'classnames';
import React, { ComponentType, memo } from 'react';

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

export default function withIconContainer<TProps extends Record<string, any>>(
    OriginalComponent: ComponentType<TProps>,
): ComponentType<TProps & IconProps> {
    return memo(({ additionalClassName, size, testId, ...rest }) => (
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
            <OriginalComponent {...(rest as TProps)} />
        </div>
    ));
}
