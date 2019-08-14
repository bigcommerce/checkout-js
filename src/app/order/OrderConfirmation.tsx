import { CheckoutSelectors, EmbeddedCheckoutMessenger, EmbeddedCheckoutMessengerOptions, Order, ShopperConfig, ShopperCurrency, StoreConfig, StoreCurrency } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import DOMPurify from 'dompurify';
import React, { lazy, Component, Fragment, ReactNode, Suspense } from 'react';

import { StepTracker } from '../analytics';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { ErrorLogger, ErrorModal } from '../common/error';
import { isEmbedded, EmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { CreatedCustomer, GuestSignUpForm, SignedUpSuccessAlert, SignUpFormValues } from '../guestSignup';
import { AccountCreationFailedError, AccountCreationRequirementsError } from '../guestSignup/errors';
import { TranslatedString } from '../locale';
import { Button, ButtonVariant } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';

import getPaymentInstructions from './getPaymentInstructions';
import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import OrderConfirmationSection from './OrderConfirmationSection';
import OrderStatus from './OrderStatus';
import PrintLink from './PrintLink';
import ThankYouHeader from './ThankYouHeader';

const OrderSummary = lazy(() => import(
    /* webpackChunkName: "order-summary" */
    './OrderSummary'
));

const OrderSummaryDrawer = lazy(() => import(
    /* webpackChunkName: "order-summary-drawer" */
    './OrderSummaryDrawer'
));

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
    createStepTracker(): StepTracker;
}

interface WithCheckoutOrderConfirmationProps {
    order?: Order;
    config?: StoreConfig;
    loadOrder(orderId: number): Promise<CheckoutSelectors>;
    isLoadingOrder(): boolean;
}

class OrderConfirmation extends Component<
    OrderConfirmationProps & WithCheckoutOrderConfirmationProps,
    OrderConfirmationState
> {
    state: OrderConfirmationState = {};

    private embeddedMessenger?: EmbeddedCheckoutMessenger;

    componentDidMount(): void {
        const {
            containerId,
            createEmbeddedMessenger,
            createStepTracker,
            embeddedStylesheet,
            loadOrder,
            orderId,
        } = this.props;

        loadOrder(orderId)
            .then(({ data }) => {
                const { links: { siteLink = '' } = {} } = data.getConfig() || {};
                const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

                this.embeddedMessenger = messenger;

                messenger.receiveStyles(styles => embeddedStylesheet.append(styles));
                messenger.postFrameLoaded({ contentId: containerId });

                createStepTracker().trackOrderComplete();
            })
            .catch(this.handleUnhandledError);
    }

    render(): ReactNode {
        const {
            order,
            config,
            isLoadingOrder,
        } = this.props;

        if (!order || !config || isLoadingOrder()) {
            return <LoadingSpinner isLoading={ true } />;
        }

        const paymentInstructions = getPaymentInstructions(order);
        const {
            storeProfile: {
                orderEmail,
                storePhoneNumber,
            },
            currency,
            shopperCurrency,
            shopperConfig,
            links: {
                siteLink,
            },
        } = config;

        return (
            <div className={ classNames(
                'layout optimizedCheckout-contentPrimary',
                { 'is-embedded': isEmbedded() }
            ) }>
                <div className="layout-main">
                    <div className="orderConfirmation">
                        <ThankYouHeader name={ order.billingAddress.firstName } />

                        <OrderStatus
                            order={ order }
                            supportEmail={ orderEmail }
                            supportPhoneNumber={ storePhoneNumber }
                        />

                        { paymentInstructions && <OrderConfirmationSection>
                            <div
                                data-test="payment-instructions"
                                dangerouslySetInnerHTML={ {
                                    __html: DOMPurify.sanitize(paymentInstructions),
                                } }
                            />
                        </OrderConfirmationSection> }

                        { this.renderGuestSignUp({
                            customerCanBeCreated: order.customerCanBeCreated,
                            shopperConfig,
                        }) }

                        <div className="continueButtonContainer">
                            <a href={ siteLink } target="_top">
                                <Button variant={ ButtonVariant.Secondary }>
                                    <TranslatedString id="order_confirmation.continue_shopping" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>

                { this.renderOrderSummary({ order, currency, shopperCurrency }) }
                { this.renderErrorModal() }
            </div>
        );
    }

    private renderGuestSignUp({ customerCanBeCreated, shopperConfig }: {
        customerCanBeCreated: boolean;
        shopperConfig: ShopperConfig;
    }): ReactNode {
        const {
            isSigningUp,
            hasSignedUp,
        } = this.state;

        return <Fragment>
            { customerCanBeCreated && !hasSignedUp && <GuestSignUpForm
                isSigningUp={ isSigningUp }
                onSignUp={ this.handleSignUp }
                passwordRequirements={ this.getPasswordRequirements(shopperConfig) }
            /> }

            { hasSignedUp && <SignedUpSuccessAlert /> }
        </Fragment>;
    }

    private renderOrderSummary({ order, currency, shopperCurrency }: {
        order: Order;
        currency: StoreCurrency;
        shopperCurrency: ShopperCurrency;
    }): ReactNode {
        return (
            <Fragment>
                <aside className="layout-cart">
                    <Suspense fallback={ <LoadingSpinner isLoading /> }>
                        <OrderSummary
                            headerLink={ <PrintLink /> }
                            { ...mapToOrderSummarySubtotalsProps(order) }
                            lineItems={ order.lineItems }
                            total={ order.orderAmount }
                            storeCurrency={ currency }
                            shopperCurrency={ shopperCurrency }
                        />
                    </Suspense>
                </aside>

                <Suspense fallback={ <LoadingSpinner isLoading /> }>
                    <OrderSummaryDrawer
                        { ...mapToOrderSummarySubtotalsProps(order) }
                        headerLink={ <PrintLink className="modal-header-link cart-modal-link" /> }
                        lineItems={ order.lineItems }
                        total={ order.orderAmount }
                        storeCurrency={ currency }
                        shopperCurrency={ shopperCurrency }
                    />
                </Suspense>
            </Fragment>
        );
    }

    private renderErrorModal(): ReactNode {
        const { error } = this.state;

        return (
            <ErrorModal
                error={ error }
                onClose={ () => {
                    this.setState({ error: undefined });
                } }
            />
        );
    }

    private handleSignUp: (values: SignUpFormValues) => void = ({ password, confirmPassword }) => {
        const { createAccount, config } = this.props;

        const shopperConfig = config && config.shopperConfig;
        const passwordRequirements = (shopperConfig &&
            shopperConfig.passwordRequirements &&
            shopperConfig.passwordRequirements.error) || '';

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
            .catch(error => {
                this.setState({
                    error: (error.status < 500) ?
                        new AccountCreationRequirementsError(error, passwordRequirements) :
                        new AccountCreationFailedError(error),
                    hasSignedUp: false,
                    isSigningUp: false,
                });
            });
    };

    private handleUnhandledError: (error: Error) => void = error => {
        const { errorLogger } = this.props;

        this.setState({ error });
        errorLogger.log(error);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postError(error);
        }
    };

    private getPasswordRequirements(config: ShopperConfig) {
        const allSlashes = new RegExp('/', 'g');
        const { passwordRequirements } = config;
        const { minlength, error, alpha, numeric } = passwordRequirements;

        return {
            minLength: minlength,
            description: error,
            alpha: new RegExp(alpha.replace(allSlashes, '')),
            numeric: new RegExp(numeric.replace(allSlashes, '')),
        };
    }
}

export function mapToOrderConfirmationProps(
    context: CheckoutContextProps
): WithCheckoutOrderConfirmationProps | null {
    const {
        checkoutState: {
            data: {
                getOrder,
                getConfig,
            },
            statuses: {
                isLoadingOrder,
            },
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

export default withCheckout(mapToOrderConfirmationProps)(OrderConfirmation);
