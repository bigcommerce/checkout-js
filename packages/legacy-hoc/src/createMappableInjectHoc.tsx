import React, { ComponentType, Context, FunctionComponent, memo, useContext, useMemo } from 'react';
import { Omit } from 'utility-types';

import { MatchedProps } from './InjectHoc';
import MappableInjectHoc, { MapToProps, MapToPropsFactory } from './MappableInjectHoc';

function isMapToPropsFactory<TContextProps, TMappedProps, TOwnProps>(
    mapToProps:
        | MapToProps<TContextProps, TMappedProps, TOwnProps>
        | MapToPropsFactory<TContextProps, TMappedProps, TOwnProps>,
): mapToProps is MapToPropsFactory<TContextProps, TMappedProps, TOwnProps> {
    return mapToProps.length === 0;
}

export default function createMappableInjectHoc<TContextProps>(
    ContextComponent: Context<TContextProps>,
    options?: { displayNamePrefix?: string },
): MappableInjectHoc<NonNullable<TContextProps>> {
    return <TMappedProps, TOwnProps>(
        mapToPropsOrFactory:
            | MapToProps<NonNullable<TContextProps>, TMappedProps, TOwnProps>
            | MapToPropsFactory<NonNullable<TContextProps>, TMappedProps, TOwnProps>,
    ) => {
        return <TProps extends MatchedProps<TMappedProps, TProps>>(
            OriginalComponent: ComponentType<TProps>,
        ) => {
            const InnerDecoratedComponent: FunctionComponent<TProps> = memo((props) => (
                <OriginalComponent {...props} />
            ));

            const DecoratedComponent: FunctionComponent<Omit<TProps, keyof TMappedProps>> = (
                props,
            ) => {
                const context = useContext(ContextComponent);

                const mapToProps = useMemo(
                    () =>
                        isMapToPropsFactory(mapToPropsOrFactory)
                            ? mapToPropsOrFactory()
                            : mapToPropsOrFactory,
                    [],
                );

                const mappedProps = context
                    ? mapToProps(context, props as unknown as TOwnProps)
                    : context;

                if (!mappedProps) {
                    return null;
                }

                const mergedProps = { ...mappedProps, ...props } as unknown as TProps;

                return <InnerDecoratedComponent {...mergedProps} />;
            };

            if (options && options.displayNamePrefix && OriginalComponent) {
                DecoratedComponent.displayName = `${options.displayNamePrefix}(${
                    OriginalComponent.displayName || OriginalComponent.name
                })`;
            }

            return DecoratedComponent;
        };
    };
}
