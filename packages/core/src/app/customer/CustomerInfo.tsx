import { CheckoutSelectors, CustomerRequestOptions, CustomError } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';
import { isExperimentEnabled } from '../common/utility';

import canSignOut from './canSignOut';

export interface CustomerInfoProps {
    onSignOut?(event: CustomerSignOutEvent): void;
    onSignOutError?(error: CustomError): void;
}

export interface CustomerSignOutEvent {
    isCartEmpty: boolean;
}

interface WithCheckoutCustomerInfoProps {
    email: string;
    methodId: string;
    isRedirectExperimentEnabled: boolean;
    isSignedIn: boolean;
    isSigningOut: boolean;
    logoutLink: string;
    shouldRedirectToStorefrontForAuth: boolean;
    signOut(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
}

const CustomerInfo: FunctionComponent<CustomerInfoProps & WithCheckoutCustomerInfoProps> = ({
    email
    ,
}) => {

    return (
        <div className="customerView" data-test="checkout-customer-info">
            <div
                className="customerView-body optimizedCheckout-contentPrimary"
                data-test="customer-info"
            >
                {email}
            </div>

            <div className="customerView-actions">
                
            </div>
        </div>
    );
};

function mapToWithCheckoutCustomerInfoProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutCustomerInfoProps | null {
    const {
        data: { getBillingAddress, getCheckout, getCustomer, getConfig },
        statuses: { isSigningOut },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();
    const config = getConfig();

    if (!billingAddress || !checkout || !customer || !config) {
        return null;
    }

    const { checkoutSettings, links: { logoutLink } } = config;

    const isRedirectExperimentEnabled = isExperimentEnabled(checkoutSettings, 'CHECKOUT-9138.redirect_to_storefront_for_auth');

    const methodId =
        checkout.payments && checkout.payments.length === 1 ? checkout.payments[0].providerId : '';

    return {
        email: billingAddress.email || customer.email,
        methodId,
        isRedirectExperimentEnabled,
        isSignedIn: canSignOut(customer, checkout, methodId),
        isSigningOut: isSigningOut(),
        logoutLink,
        shouldRedirectToStorefrontForAuth: checkoutSettings.shouldRedirectToStorefrontForAuth,
        signOut: checkoutService.signOutCustomer,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CustomerInfo);
