import { ComponentType } from 'react';

type ResolvableComponent<TProps, TIdentifier> = ComponentType<TProps> & {
    resolveIds: TIdentifier[];
};

export default ResolvableComponent;
