import { type CheckoutSelectors, type CustomerRequestOptions, type CustomError } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { type CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../checkout';
import { isErrorWithType } from '../common/error';
import { Button, ButtonSize, ButtonVariant } from '../ui/button';

import canSignOut, { isSupportedSignoutMethod } from './canSignOut';

export interface CustomerInfoProps {
    onSignOut?(event: CustomerSignOutEvent): void;
    onSignOutError?(error: CustomError): void;
}

export interface CustomerSignOutEvent {
    isCartEmpty: boolean;
}

interface WithCheckoutCustomerInfoProps {
    checkoutLink: string;
    email: string;
    methodId: string;
    isSignedIn: boolean;
    isSigningOut: boolean;
    logoutLink: string;
    shouldRedirectToStorefrontForAuth: boolean;
    signOut(options?: CustomerRequestOptions): Promise<CheckoutSelectors>;
}

const CustomerInfo: FunctionComponent<CustomerInfoProps & WithCheckoutCustomerInfoProps> = ({
    checkoutLink,
    email,
    methodId,
    isSignedIn,
    isSigningOut,
    logoutLink,
    shouldRedirectToStorefrontForAuth,
    onSignOut = noop,
    onSignOutError = noop,
    signOut,
}) => {
    const { themeV2 } = useThemeContext();

    const handleSignOut: () => Promise<void> = async () => {
        try {
            if (shouldRedirectToStorefrontForAuth) {
                window.location.assign(`${logoutLink}?redirectTo=${checkoutLink}`);

                return;
            }

            if (isSupportedSignoutMethod(methodId)) {
                await signOut({ methodId });
                onSignOut({ isCartEmpty: false });
                window.location.reload();
            } else {
                await signOut();
                onSignOut({ isCartEmpty: false });
            }
        } catch (error) {
            if (isErrorWithType(error) && error.type === 'checkout_not_available') {
                onSignOut({ isCartEmpty: true });
            } else {
                onSignOutError(error);
            }
        }
    };

    return (
        <div className="customerView" data-test="checkout-customer-info">
            <div
                className={classNames('customerView-body',
                    { 'body-regular': themeV2 },
                )}
                data-test="customer-info"
            >
                {email}
            </div>

            <div className="customerView-actions">
                {isSignedIn && (
                    <Button
                        className={themeV2 ? 'body-regular' : ''}
                        isLoading={isSigningOut}
                        onClick={handleSignOut}
                        size={ButtonSize.Tiny}
                        testId="sign-out-link"
                        variant={ButtonVariant.Secondary}
                    >
                        <TranslatedString id="customer.sign_out_action" />
                    </Button>
                )}
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

    const { checkoutSettings, links: { checkoutLink, logoutLink } } = config;

    const methodId =
        checkout.payments && checkout.payments.length === 1 ? checkout.payments[0].providerId : '';

    return {
        email: billingAddress.email || customer.email,
        methodId,
        isSignedIn: canSignOut(customer, checkout, methodId),
        isSigningOut: isSigningOut(),
        logoutLink,
        checkoutLink,
        shouldRedirectToStorefrontForAuth: checkoutSettings.shouldRedirectToStorefrontForAuth,
        signOut: checkoutService.signOutCustomer,
    };
}

export default withCheckout(mapToWithCheckoutCustomerInfoProps)(CustomerInfo);
