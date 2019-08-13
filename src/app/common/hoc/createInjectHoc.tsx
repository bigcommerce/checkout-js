
import { isEmpty, pickBy } from 'lodash';
import React, { useContext, ComponentType, Context } from 'react';

import InjectHoc from './InjectHoc';

export interface InjectHocOptions<TInjectedProps> {
    displayNamePrefix?: string;
    pickProps?(value: TInjectedProps[keyof TInjectedProps], key: keyof TInjectedProps): boolean;
}

export default function createInjectHoc<
    TInjectedProps extends object | undefined,
    TPickedProps extends Partial<TInjectedProps> = TInjectedProps
>(
    ContextComponent: Context<TInjectedProps>,
    options?: InjectHocOptions<TInjectedProps>
): InjectHoc<NonNullable<TPickedProps>> {
    return <TProps extends TPickedProps>(
        OriginalComponent: ComponentType<TProps>
    ) => {
        const {
            displayNamePrefix = '',
            pickProps = () => true,
        } = options || {};

        const DecoratedComponent = (props: Omit<TProps, keyof NonNullable<TPickedProps>>) => {
            const context = useContext(ContextComponent);
            const injectedProps = pickBy(context, (value, key) => pickProps(value, key as keyof TInjectedProps));

            if (isEmpty(injectedProps)) {
                return null;
            }

            const mergedProps = { ...injectedProps, ...props } as unknown as TProps;

            return <OriginalComponent { ...mergedProps } />;
        };

        if (displayNamePrefix) {
            DecoratedComponent.displayName = `${displayNamePrefix}(${OriginalComponent.displayName || OriginalComponent.name})`;
        }

        return DecoratedComponent;
    };
}
