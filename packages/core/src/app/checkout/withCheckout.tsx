import React, { type ComponentType, memo, useContext, useMemo } from 'react';
import { type Omit } from 'utility-types';

import { CheckoutContext, type CheckoutContextProps, useCheckout } from '@bigcommerce/checkout/contexts';
import { createMappableInjectHoc, type MapToProps, type MapToPropsFactory, type MatchedProps } from '@bigcommerce/checkout/legacy-hoc';

export type WithCheckoutProps = CheckoutContextProps;

function isMapToPropsFactory<TContextProps, TMappedProps, TOwnProps>(
    mapToProps:
        | MapToProps<TContextProps, TMappedProps, TOwnProps>
        | MapToPropsFactory<TContextProps, TMappedProps, TOwnProps>,
): mapToProps is MapToPropsFactory<TContextProps, TMappedProps, TOwnProps> {
    return mapToProps.length === 0;
}

const withCheckoutV1 = createMappableInjectHoc(CheckoutContext, {
    displayNamePrefix: 'WithCheckout',
});

const withCheckout = <TMappedProps, TOwnProps>(
    mapToPropsOrFactory:
        | MapToProps<CheckoutContextProps, TMappedProps, TOwnProps>
        | MapToPropsFactory<CheckoutContextProps, TMappedProps, TOwnProps>,
) => {
    return <TProps extends MatchedProps<TMappedProps, TProps> & TOwnProps>(
        OriginalComponent: ComponentType<TProps>,
    ) => {
        const InnerDecoratedComponent: React.FunctionComponent<TProps> = memo((props) => (
            <OriginalComponent {...props} />
        ));

        const InnerDecoratedComponentV1 = withCheckoutV1(mapToPropsOrFactory)(OriginalComponent);

        const DecoratedComponent: React.FunctionComponent<Omit<TProps, keyof TMappedProps>> = (
            props,
        ) => {
            const context = useContext(CheckoutContext);
            const isUseCheckoutHookExperimentEnabled = context?.isUseCheckoutHookExperimentEnabled ?? false;

            const mapToProps = useMemo(
                () =>
                    isMapToPropsFactory(mapToPropsOrFactory)
                        ? mapToPropsOrFactory()
                        : mapToPropsOrFactory,
                [],
            );

            const { selectedState } = useCheckout<TMappedProps | null>(
                context
                    ? (state) => {
                          const contextForMapping: CheckoutContextProps = {
                              ...context,
                              checkoutState: state,
                          };

                          return mapToProps(contextForMapping, props as unknown as TOwnProps);
                      }
                    : undefined,
            );

            if (isUseCheckoutHookExperimentEnabled) {
                const mergedProps = { ...(selectedState ?? {}), ...props } as unknown as TProps;

                return <InnerDecoratedComponent {...mergedProps} />;
            }

            return <InnerDecoratedComponentV1 {...props} />;
        };

        if (OriginalComponent) {
            DecoratedComponent.displayName = `WithCheckout(${
                OriginalComponent.displayName || OriginalComponent.name
            })`;
        }

        return DecoratedComponent;
    };
};

export default withCheckout;
