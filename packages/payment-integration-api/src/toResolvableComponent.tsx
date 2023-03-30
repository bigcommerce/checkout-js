import React, { ComponentType } from 'react';

import ResolvableComponent from './ResolvableComponent';

export default function toResolvableComponent<TProps extends Record<string, any>, TIdentifier>(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: ComponentType<TProps>,
    resolveIds: TIdentifier[],
): ResolvableComponent<TProps, TIdentifier> {
    return Object.assign((props: TProps) => <Component {...props} />, { resolveIds });
}
