import { CheckoutButtonProps, CheckoutButtonResolveId } from '@bigcommerce/checkout/payment-integration-api';
import { ComponentType } from 'react';

import { resolveComponent } from '../common/resolver';

export default function resolveCheckoutButton(resolveId: CheckoutButtonResolveId): ComponentType<CheckoutButtonProps> | undefined {
    return resolveComponent<CheckoutButtonResolveId, CheckoutButtonProps>(
        resolveId,
        require('../generated/checkoutButtons')
    );
}
