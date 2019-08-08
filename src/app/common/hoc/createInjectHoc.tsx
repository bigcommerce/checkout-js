
import { isEmpty, pickBy } from 'lodash';
import React, { ComponentType, Context } from 'react';

import InjectHoc from './InjectHoc';

export interface InjectHocOptions<TInjectedProps> {
    displayNamePrefix?: string;
    pickProps?(value: TInjectedProps[keyof TInjectedProps], key: keyof TInjectedProps): boolean;
}

export default function createInjectHoc<TInjectedProps extends { [key: string]: any } | undefined, TPickedProps extends Partial<TInjectedProps> = TInjectedProps>(
    ContextComponent: Context<TInjectedProps>,
    options?: InjectHocOptions<TInjectedProps>
): InjectHoc<NonNullable<TPickedProps>> {
    return <TProps extends Partial<TInjectedProps>>(
        OriginalComponent: ComponentType<TProps>
    ) => {
        const {
            displayNamePrefix = '',
            pickProps = () => true,
        } = options || {};

        const DecoratedComponent = (props: any) => (
            <ContextComponent.Consumer>
                { context => {
                    const injectedProps = context ? pickBy(context, (value, key) => pickProps(value, key as keyof TInjectedProps)) : null;

                    if (isEmpty(injectedProps)) {
                        return null;
                    }

                    return (
                        <OriginalComponent
                            { ...injectedProps }
                            { ...props }
                        />
                    );
                } }
            </ContextComponent.Consumer>
        );

        if (displayNamePrefix) {
            DecoratedComponent.displayName = `${displayNamePrefix}(${OriginalComponent.displayName || OriginalComponent.name})`;
        }

        return DecoratedComponent;
    };
}
