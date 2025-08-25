import { type ComponentType } from 'react';

import { type ResolvableComponent } from '.';

export default function isResolvableComponent<TProps, TIdentifier>(
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Component: ComponentType<TProps>,
): Component is ResolvableComponent<TProps, TIdentifier> {
    return 'resolveIds' in Component;
}
