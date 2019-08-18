import { CheckoutSelectors, CustomError } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { TranslatedString } from '../locale';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';

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
    isSignedIn: boolean;
    isSigningOut: boolean;
    signOut(): Promise<CheckoutSelectors>;
}

const CustomerInfo: FunctionComponent<CustomerInfoProps & WithCheckoutCustomerInfoProps> = ({
    email,
    isSignedIn,
    isSigningOut,
    onSignOut = noop,
    onSignOutError = noop,
    signOut,
}) => {
    const handleSignOut: () => Promise<void> = async () => {
        try {
            await signOut();
            onSignOut({ isCartEmpty: false });
        } catch (error) {
            if (error.type === 'checkout_not_available') {
                onSignOut({ isCartEmpty: true });
            } else {
                onSignOutError(error);
            }
        }
    };

    return (
        <div
            className="customerView"
            data-test="checkout-customer-info"
        >
            <div
                className="customerView-body optimizedCheckout-contentPrimary"
                data-test="customer-info"
            >
                { email }
            </div>

            <div className="customerView-actions">
                { isSignedIn && <Button
                    testId="sign-out-link"
                    isLoading={ isSigningOut }
                    onClick={ handleSignOut }
                    size={ ButtonSize.Tiny }
                    variant={ ButtonVariant.Secondary }
                >
                    <TranslatedString id="customer.sign_out_action" />
                </Button> }
            </div>
        </div>
    );
};

function mapToWithCheckoutCustomerInfoProps(
    { checkoutService, checkoutState }: CheckoutContextProps
): WithCheckoutCustomerInfoProps | null {
    const {
        data: { getBillingAddress, getCheckout, getCustomer },
        statuses: { isSigningOut },
    } = checkoutState;

    const billingAddress = getBillingAddress();
    const checkout = getCheckout();
    const customer = getCustomer();

    if (!billingAddress || !checkout || !customer) {
        return null;
    }

    return {
        email: billingAddress.email || customer.email,
        isSignedIn: canSignOut(customer, checkout),
        isSigningOut: isSigningOut(),
        signOut: checkoutService.signOutCustomer,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CustomerInfo);
