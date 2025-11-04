import React, { type ComponentType, memo, useContext, useMemo } from 'react';
import { type Omit } from 'utility-types';

import { CheckoutContext, type CheckoutContextProps, CheckoutContextV2, useCheckout } from '@bigcommerce/checkout/contexts';
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

        const DecoratedComponent: React.FunctionComponent<Omit<TProps, keyof TMappedProps>> = (
            props,
        ) => {
            const contextV2 = useContext(CheckoutContextV2);
            const isUseCheckoutHookExperimentEnabled = contextV2?.isUseCheckoutHookExperimentEnabled ?? false;

            const mapToProps = useMemo(
                () =>
                    isMapToPropsFactory(mapToPropsOrFactory)
                        ? mapToPropsOrFactory()
                        : mapToPropsOrFactory,
                [],
            );

            const { selectedState } = useCheckout<TMappedProps | null>(
                contextV2
                    ? (state) => {
                          const contextForMapping: CheckoutContextProps = {
                              ...contextV2,
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

            const InnerDecoratedComponentV1 = withCheckoutV1(mapToPropsOrFactory)(OriginalComponent);

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
