import { type ComponentType } from 'react';

import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveComponent, resolveLazyComponent } from '../common/resolver';
import * as checkoutButtons from '../generated/checkoutButtons';
import * as lazyCheckoutButtons from '../generated/checkoutButtons/lazy';

export default function resolveCheckoutButton(
    resolveId: CheckoutButtonResolveId,
    useLazyLoad: boolean,
): ComponentType<CheckoutButtonProps> | undefined {
    if (useLazyLoad) {
        const { ComponentRegistry, ...components } = lazyCheckoutButtons;

        return resolveLazyComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
            resolveId,
            components,
            ComponentRegistry,
        );
    }

    return resolveComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
        resolveId,
        checkoutButtons,
    );
}
