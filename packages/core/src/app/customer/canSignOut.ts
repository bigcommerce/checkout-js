import { Checkout, Customer } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

import { SUPPORTED_METHODS } from './CheckoutButtonList';

const SUPPORTED_SIGNOUT_METHODS = ['amazonpay'];

export const isSupportedSignoutMethod = (methodId: string): boolean => {
    return SUPPORTED_SIGNOUT_METHODS.indexOf(methodId) > -1;
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
        (payment) => SUPPORTED_METHODS.indexOf(payment.providerId) === -1,
    );
}
