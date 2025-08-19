import { type Checkout, type Customer } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

import { SUPPORTED_METHODS } from './getSupportedMethods';

const SUPPORTED_SIGNOUT_METHODS = ['amazonpay'];

export const isSupportedSignoutMethod = (methodId: string): boolean => {
    return SUPPORTED_SIGNOUT_METHODS.includes(methodId);
};

export default function canSignOut(
    customer: Customer,
    checkout: Checkout,
    methodId: string,
): boolean {
    if (isSupportedSignoutMethod(methodId)) {
        return true;
    }

    if (customer.isGuest) {
        return false;
    }

    // Return false if payment method offers its own checkout button
    return every(
        checkout.payments,
        (payment) => !SUPPORTED_METHODS.includes(payment.providerId),
    );
}
