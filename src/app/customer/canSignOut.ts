import { Checkout, Customer } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

import { SUPPORTED_METHODS } from './CheckoutButtonList';

export default function canSignOut(customer: Customer, checkout: Checkout): boolean {
    if (customer.isGuest) {
        return false;
    }

    // Return false if payment method offers its own checkout button
    return every(checkout.payments, payment =>
        SUPPORTED_METHODS.indexOf(payment.providerId) === -1
    );
}
