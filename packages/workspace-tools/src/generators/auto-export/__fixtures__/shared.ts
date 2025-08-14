import type { ComponentType } from 'react';

export function toResolvableComponent<TProps>(
    component: ComponentType<TProps>,
    _resolveIds: TestResolveIds[],
): ComponentType<TProps> {
    return component;
}

export interface TestResolveIds {
    id?: string;
    gateway?: string;
}
