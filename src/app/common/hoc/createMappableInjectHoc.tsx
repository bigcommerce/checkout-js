import React, { ComponentType, Context, FunctionComponent, PureComponent, ReactNode } from 'react';
import { Omit } from 'utility-types';

import { MatchedProps } from './InjectHoc';
import MappableInjectHoc from './MappableInjectHoc';

export default function createMappableInjectHoc<TContextProps>(
    ContextComponent: Context<TContextProps>,
    options?: { displayNamePrefix?: string }
): MappableInjectHoc<TContextProps> {
    return <TMappedProps, TOwnProps>(mapToProps: (context: NonNullable<TContextProps>, props: TOwnProps) => TMappedProps | null) => {
        return <TProps extends MatchedProps<TMappedProps, TProps>>(OriginalComponent: ComponentType<TProps>) => {
            class InnerDecoratedComponent extends PureComponent<TProps> {
                render(): ReactNode {
                    return <OriginalComponent { ...this.props } />;
                }
            }

            const DecoratedComponent: FunctionComponent<Omit<TProps, keyof TMappedProps>> = props => (
                <ContextComponent.Consumer>
                    { context => {
                        if (!context) {
                            return null;
                        }

                        const mappedProps = context ? mapToProps(context as NonNullable<TContextProps>, props as unknown as TOwnProps) : context;

                        if (!mappedProps) {
                            return null;
                        }

                        const mergedProps = { ...mappedProps, ...props } as unknown as TProps;

                        return <InnerDecoratedComponent { ...mergedProps } />;
                    } }
                </ContextComponent.Consumer>
            );

            if (options && options.displayNamePrefix && OriginalComponent) {
                DecoratedComponent.displayName = `${options.displayNamePrefix}(${OriginalComponent.displayName || OriginalComponent.name})`;
            }

            return DecoratedComponent;
        };
    };
}
