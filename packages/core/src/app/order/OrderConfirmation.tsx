import {
    CheckoutSelectors,
    EmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessengerOptions,
    Order,
    ShopperConfig,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import React, { Component, lazy, ReactNode } from 'react';

import { AnalyticsContextProps } from '@bigcommerce/checkout/analytics';
import { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withAnalytics } from '../analytics';
import { withCheckout } from '../checkout';
import { ErrorModal } from '../common/error';
import { retry } from '../common/utility';
import { getPasswordRequirementsFromConfig } from '../customer';
import { EmbeddedCheckoutStylesheet, isEmbedded } from '../embeddedCheckout';
import {
    CreatedCustomer,
    GuestSignUpForm,
    PasswordSavedSuccessAlert,
    SignedUpSuccessAlert,
    SignUpFormValues,
} from '../guestSignup';
import {
    AccountCreationFailedError,
    AccountCreationRequirementsError,
} from '../guestSignup/errors';
import { Button, ButtonVariant } from '../ui/button';
import { LazyContainer, LoadingSpinner } from '../ui/loading';
import { MobileView } from '../ui/responsive';

import getPaymentInstructions from './getPaymentInstructions';
import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import OrderConfirmationSection from './OrderConfirmationSection';
import OrderStatus from './OrderStatus';
import PrintLink from './PrintLink';
import ThankYouHeader from './ThankYouHeader';

const OrderSummary = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "order-summary" */
                './OrderSummary'
            ),
    ),
);

const OrderSummaryDrawer = lazy(() =>
    retry(
        () =>
            import(
                /* webpackChunkName: "order-summary-drawer" */
                './OrderSummaryDrawer'
            ),
    ),
);

export interface OrderConfirmationState {
    error?: Error;
    hasSignedUp?: boolean;
    isSigningUp?: boolean;
}

export interface OrderConfirmationProps {
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    errorLogger: ErrorLogger;
    orderId: number;
    createAccount(values: SignUpFormValues): Promise<CreatedCustomer>;
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
}

interface WithCheckoutOrderConfirmationProps {
    order?: Order;
    config?: StoreConfig;
    loadOrder(orderId: number): Promise<CheckoutSelectors>;
    isLoadingOrder(): boolean;
}

class OrderConfirmation extends Component<
    OrderConfirmationProps & WithCheckoutOrderConfirmationProps & AnalyticsContextProps,
    OrderConfirmationState
> {
    state: OrderConfirmationState = {};

    private embeddedMessenger?: EmbeddedCheckoutMessenger;

    componentDidMount(): void {
        const {
            containerId,
            createEmbeddedMessenger,
            embeddedStylesheet,
            loadOrder,
            orderId,
            analyticsTracker
        } = this.props;

        loadOrder(orderId)
            .then(({ data }) => {
                const { links: { siteLink = '' } = {} } = data.getConfig() || {};
                const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

                this.embeddedMessenger = messenger;

                messenger.receiveStyles((styles) => embeddedStylesheet.append(styles));
                messenger.postFrameLoaded({ contentId: containerId });

                analyticsTracker.orderPurchased();
            })
            .catch(this.handleUnhandledError);
    }

    render(): ReactNode {
        const { order, config, isLoadingOrder } = this.props;

        if (!order || !config || isLoadingOrder()) {
            return <LoadingSpinner isLoading={true} />;
        }

        const paymentInstructions = getPaymentInstructions(order);
        const {
            storeProfile: { orderEmail, storePhoneNumber },
            shopperConfig,
            links: { siteLink },
        } = config;

        return (
            <div
                className={classNames('layout optimizedCheckout-contentPrimary', {
                    'is-embedded': isEmbedded(),
                })}
            >
                <div className="layout-main">
                    <div className="orderConfirmation">
                        <ThankYouHeader name={order.billingAddress.firstName} />

                        <OrderStatus
                            config={config}
                            order={order}
                            supportEmail={orderEmail}
                            supportPhoneNumber={storePhoneNumber}
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

                        {this.renderGuestSignUp({
                            shouldShowPasswordForm: order.customerCanBeCreated,
                            customerCanBeCreated: !order.customerId,
                            shopperConfig,
                        })}

                        <div className="continueButtonContainer">
                            <form action={siteLink} method="get" target="_top">
                                <Button type="submit" variant={ButtonVariant.Secondary}>
                                    <TranslatedString id="order_confirmation.continue_shopping" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {this.renderOrderSummary()}
                {this.renderErrorModal()}
            </div>
        );
    }

    private renderGuestSignUp({
        customerCanBeCreated,
        shouldShowPasswordForm,
        shopperConfig,
    }: {
        customerCanBeCreated: boolean;
        shouldShowPasswordForm: boolean;
        shopperConfig: ShopperConfig;
    }): ReactNode {
        const { isSigningUp, hasSignedUp } = this.state;

        const { order } = this.props;

        return (
            <>
                {shouldShowPasswordForm && !hasSignedUp && (
                    <GuestSignUpForm
                        customerCanBeCreated={customerCanBeCreated}
                        isSigningUp={isSigningUp}
                        onSignUp={this.handleSignUp}
                        passwordRequirements={getPasswordRequirementsFromConfig(shopperConfig)}
                    />
                )}

                {hasSignedUp &&
                    (order?.customerId ? <PasswordSavedSuccessAlert /> : <SignedUpSuccessAlert />)}
            </>
        );
    }

    private renderOrderSummary(): ReactNode {
        const { order, config } = this.props;

        if (!order || !config) {
            return null;
        }

        const { currency, shopperCurrency } = config;

        return (
            <MobileView>
                {(matched) => {
                    if (matched) {
                        return (
                            <LazyContainer>
                                <OrderSummaryDrawer
                                    {...mapToOrderSummarySubtotalsProps(order)}
                                    headerLink={
                                        <PrintLink className="modal-header-link cart-modal-link" />
                                    }
                                    isUpdatedCartSummayModal={false}
                                    lineItems={order.lineItems}
                                    shopperCurrency={shopperCurrency}
                                    storeCurrency={currency}
                                    total={order.orderAmount}
                                />
                            </LazyContainer>
                        );
                    }

                    return (
                        <aside className="layout-cart">
                            <LazyContainer>
                                <OrderSummary
                                    headerLink={<PrintLink />}
                                    {...mapToOrderSummarySubtotalsProps(order)}
                                    lineItems={order.lineItems}
                                    shopperCurrency={shopperCurrency}
                                    storeCurrency={currency}
                                    total={order.orderAmount}
                                />
                            </LazyContainer>
                        </aside>
                    );
                }}
            </MobileView>
        );
    }

    private renderErrorModal(): ReactNode {
        const { error } = this.state;

        return (
            <ErrorModal
                error={error}
                onClose={this.handleErrorModalClose}
                shouldShowErrorCode={false}
            />
        );
    }

    private handleErrorModalClose: () => void = () => {
        this.setState({ error: undefined });
    };

    private handleSignUp: (values: SignUpFormValues) => void = ({ password, confirmPassword }) => {
        const { createAccount, config } = this.props;

        const shopperConfig = config && config.shopperConfig;
        const passwordRequirements =
            (shopperConfig &&
                shopperConfig.passwordRequirements &&
                shopperConfig.passwordRequirements.error) ||
            '';

        this.setState({
            isSigningUp: true,
        });

        createAccount({
            password,
            confirmPassword,
        })
            .then(() => {
                this.setState({
                    hasSignedUp: true,
                    isSigningUp: false,
                });
            })
            .catch((error) => {
                this.setState({
                    error:
                        error.status < 500
                            ? new AccountCreationRequirementsError(error, passwordRequirements)
                            : new AccountCreationFailedError(error),
                    hasSignedUp: false,
                    isSigningUp: false,
                });
            });
    };

    private handleUnhandledError: (error: Error) => void = (error) => {
        const { errorLogger } = this.props;

        this.setState({ error });
        errorLogger.log(error);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postError(error);
        }
    };
}

export function mapToOrderConfirmationProps(
    context: CheckoutContextProps,
): WithCheckoutOrderConfirmationProps | null {
    const {
        checkoutState: {
            data: { getOrder, getConfig },
            statuses: { isLoadingOrder },
        },
        checkoutService,
    } = context;

    const config = getConfig();
    const order = getOrder();

    return {
        config,
        isLoadingOrder,
        loadOrder: checkoutService.loadOrder,
        order,
    };
}

export default withAnalytics(withCheckout(mapToOrderConfirmationProps)(OrderConfirmation));
