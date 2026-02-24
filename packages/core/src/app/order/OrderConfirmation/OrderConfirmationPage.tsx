import {
    type Order,
    type ShopperConfig,
    type ShopperCurrency,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import React, { type ReactElement } from 'react';

import { ErrorModal } from '../../common/error';
import { getPasswordRequirementsFromConfig } from '../../customer';
import { isEmbedded } from '../../embeddedCheckout';
import {
    GuestSignUpForm,
    PasswordSavedSuccessAlert,
    SignedUpSuccessAlert,
    type SignUpFormValues,
} from '../../guestSignup';
import OrderConfirmationSection from '../OrderConfirmationSection';
import OrderStatus from '../OrderStatus';
import ThankYouHeader from '../ThankYouHeader';

import { ContinueButton } from './ContinueButton';
import { OrderSummaryContainer } from './OrderSummaryContainer';

interface OrderConfirmationPageProps {
    order: Order;
    supportEmail: string;
    supportPhoneNumber: string | undefined;
    paymentInstructions: string | undefined;
    shouldShowPasswordForm: boolean;
    hasSignedUp: boolean | undefined;
    isSigningUp: boolean | undefined;
    onSignUp(values: SignUpFormValues): void;
    shopperConfig: ShopperConfig;
    customerCanBeCreated: boolean;
    siteLink: string;
    currency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    isShippingDiscountDisplayEnabled: boolean;
    error: Error | undefined;
    onErrorModalClose(): void;
}

export const OrderConfirmationPage = ({
    currency,
    customerCanBeCreated,
    error,
    hasSignedUp,
    isShippingDiscountDisplayEnabled,
    isSigningUp,
    onErrorModalClose,
    onSignUp,
    order,
    paymentInstructions,
    shopperConfig,
    shopperCurrency,
    shouldShowPasswordForm,
    siteLink,
    supportEmail,
    supportPhoneNumber,
}: OrderConfirmationPageProps): ReactElement => (
    <div
        className={classNames('layout optimizedCheckout-contentPrimary', {
            'is-embedded': isEmbedded(),
        })}
    >
        <div className="layout-main">
            <div className="orderConfirmation">
                <ThankYouHeader name={order.billingAddress.firstName} />
                <OrderStatus
                    order={order}
                    supportEmail={supportEmail}
                    supportPhoneNumber={supportPhoneNumber}
                />
                {paymentInstructions && (
                    <OrderConfirmationSection>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(paymentInstructions),
                            }}
                            data-test="payment-instructions"
                        />
                    </OrderConfirmationSection>
                )}

                {shouldShowPasswordForm && !hasSignedUp && (
                    <GuestSignUpForm
                        customerCanBeCreated={customerCanBeCreated}
                        isSigningUp={isSigningUp}
                        onSignUp={onSignUp}
                        passwordRequirements={getPasswordRequirementsFromConfig(shopperConfig)}
                    />
                )}

                {hasSignedUp &&
                    (order?.customerId ? (
                        <PasswordSavedSuccessAlert />
                    ) : (
                        <SignedUpSuccessAlert />
                    ))}

                <ContinueButton siteLink={siteLink} />
            </div>
        </div>

        <OrderSummaryContainer
            currency={currency}
            isShippingDiscountDisplayEnabled={isShippingDiscountDisplayEnabled}
            order={order}
            shopperCurrency={shopperCurrency}
        />

        <ErrorModal error={error} onClose={onErrorModalClose} shouldShowErrorCode={false} />
    </div>
);

