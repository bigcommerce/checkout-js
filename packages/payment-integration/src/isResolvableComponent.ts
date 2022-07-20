import { ComponentType } from 'react';

import { ResolvableComponent } from '.';

export default function isResolvableComponent<TProps, TIdentifier>(
    Component: ComponentType<TProps>
): Component is ResolvableComponent<TProps, TIdentifier> {
    return 'resolveIds' in Component;
}
