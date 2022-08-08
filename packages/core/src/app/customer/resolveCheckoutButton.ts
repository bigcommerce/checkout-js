import { CheckoutButtonProps } from '@bigcommerce/checkout-js/payment-integration';
import { ComponentType } from 'react';

import { resolveComponent } from '../common/resolver';
import { RequireAtLeastOne } from '../common/types';

export type CheckoutButtonResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    default?: boolean;
}>;

export default function resolveCheckoutButton(resolveId: CheckoutButtonResolveId): ComponentType<CheckoutButtonProps> | undefined {
    return resolveComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
        resolveId,
        require('../generated/checkoutButtons')
    );
}
