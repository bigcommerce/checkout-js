import { ComponentType } from 'react';

import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
} from '@bigcommerce/checkout/payment-integration-api';

import { resolveComponent } from '../common/resolver';
import * as checkoutButtons from '../generated/checkoutButtons';

export default function resolveCheckoutButton(
    resolveId: CheckoutButtonResolveId,
): ComponentType<CheckoutButtonProps> | undefined {
    const { ComponentRegistry, ...components } = checkoutButtons;

    return resolveComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
        resolveId,
        components,
        ComponentRegistry,
    );
}
