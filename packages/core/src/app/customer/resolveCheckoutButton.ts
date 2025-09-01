import { type ComponentType } from 'react';

import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveLazyComponent } from '../common/resolver';
import * as lazyCheckoutButtons from '../generated/checkoutButtons';

export default function resolveCheckoutButton(
    resolveId: CheckoutButtonResolveId
): ComponentType<CheckoutButtonProps> | undefined {
    const { ComponentRegistry, ...components } = lazyCheckoutButtons;

    return resolveLazyComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
        resolveId,
        components,
        ComponentRegistry,
    );
}
