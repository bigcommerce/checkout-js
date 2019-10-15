import { Address, Cart, CheckoutParams, CheckoutSelectors, Consignment, EmbeddedCheckoutMessenger, EmbeddedCheckoutMessengerOptions, Promotion, RequestOptions } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { find, findIndex } from 'lodash';
import React, { lazy, Component, ReactNode } from 'react';

import { NoopStepTracker, StepTracker } from '../analytics';
import { StaticBillingAddress } from '../billing';
import { EmptyCartMessage } from '../cart';
import { ErrorLogger, ErrorModal } from '../common/error';
import { retry } from '../common/utility';
import { CustomerInfo, CustomerSignOutEvent, CustomerViewType } from '../customer';
import { isEmbedded, EmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { PromotionBannerList } from '../promotion';
import { hasSelectedShippingOptions, isUsingMultiShipping, StaticConsignment } from '../shipping';
import { ShippingOptionExpiredError } from '../shipping/shippingOption';
import { FlashMessage } from '../ui/alert';
import { LazyContainer, LoadingNotification, LoadingOverlay } from '../ui/loading';
import { MobileView } from '../ui/responsive';

import mapToCheckoutProps from './mapToCheckoutProps';
import navigateToOrderConfirmation from './navigateToOrderConfirmation';
import withCheckout from './withCheckout';
import CheckoutStep from './CheckoutStep';
import CheckoutStepStatus from './CheckoutStepStatus';
import CheckoutStepType from './CheckoutStepType';
import CheckoutSupport from './CheckoutSupport';

const Billing = lazy(() => retry(() => import(
    /* webpackChunkName: "billing" */
    '../billing/Billing'
)));

const CartSummary = lazy(() => retry(() => import(
    /* webpackChunkName: "cart-summary" */
    '../cart/CartSummary'
)));

const CartSummaryDrawer = lazy(() => retry(() => import(
    /* webpackChunkName: "cart-summary-drawer" */
    '../cart/CartSummaryDrawer'
)));

const Customer = lazy(() => retry(() => import(
    /* webpackChunkName: "customer" */
    '../customer/Customer'
)));

const Payment = lazy(() => retry(() => import(
    /* webpackChunkName: "payment" */
    '../payment/Payment'
)));

const Shipping = lazy(() => retry(() => import(
    /* webpackChunkName: "shipping" */
    '../shipping/Shipping'
)));

export interface CheckoutProps {
    checkoutId: string;
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    embeddedSupport: CheckoutSupport;
    errorLogger: ErrorLogger;
    flashMessages?: FlashMessage[]; // TODO: Expose flash messages from SDK
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
    createStepTracker(): StepTracker;
    subscribeToNewsletter(data: { email: string; firstName?: string }): void;
}

export interface CheckoutState {
    activeStepType?: CheckoutStepType;
    customerViewType?: CustomerViewType;
    defaultStepType?: CheckoutStepType;
    error?: Error;
    isMultiShippingMode: boolean;
    isCartEmpty: boolean;
    isRedirecting: boolean;
    useStoreCredit: boolean;
    hasSelectedShippingOptions: boolean;
}

export interface WithCheckoutProps {
    billingAddress?: Address;
    cart?: Cart;
    consignments?: Consignment[];
    error?: Error;
    hasCartChanged: boolean;
    isGuestEnabled: boolean;
    isLoadingCheckout: boolean;
    isPending: boolean;
    loginUrl: string;
    promotions?: Promotion[];
    steps: CheckoutStepStatus[];
    usableStoreCredit: number;
    clearError(error?: Error): void;
    loadCheckout(id: string, options?: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
    subscribeToConsignments(subscriber: (state: CheckoutSelectors) => void): () => void;
}

class Checkout extends Component<CheckoutProps & WithCheckoutProps & WithLanguageProps, CheckoutState> {
    stepTracker: StepTracker = new NoopStepTracker();

    state: CheckoutState = {
        isCartEmpty: false,
        isRedirecting: false,
        useStoreCredit: true,
        isMultiShippingMode: false,
        hasSelectedShippingOptions: false,
    };

    private embeddedMessenger?: EmbeddedCheckoutMessenger;
    private unsubscribeFromConsignments?: () => void;

    componentWillUnmount(): void {
        if (this.unsubscribeFromConsignments) {
            this.unsubscribeFromConsignments();
            this.unsubscribeFromConsignments = undefined;
        }
    }

    async componentDidMount(): Promise<void> {
        const {
            checkoutId,
            containerId,
            createStepTracker,
            createEmbeddedMessenger,
            embeddedStylesheet,
            loadCheckout,
            subscribeToConsignments,
        } = this.props;

        try {
            const { data } = await loadCheckout(checkoutId, {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ] as any, // FIXME: Currently the enum is not exported so it can't be used here.
                },
            });
            const { links: { siteLink = '' } = {} } = data.getConfig() || {};
            const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

            this.unsubscribeFromConsignments = subscribeToConsignments(this.handleConsignmentsUpdated);
            this.embeddedMessenger = messenger;
            messenger.receiveStyles(styles => embeddedStylesheet.append(styles));
            messenger.postFrameLoaded({ contentId: containerId });
            messenger.postLoaded();

            this.stepTracker = createStepTracker();
            this.stepTracker.trackCheckoutStarted();

            const consignments = data.getConsignments();
            const cart = data.getCart();
            const isMultiShippingMode = !!cart && !!consignments && isUsingMultiShipping(consignments, cart.lineItems);

            if (isMultiShippingMode) {
                this.setState({ isMultiShippingMode }, this.handleReady);
            } else {
                this.handleReady();
            }
        } catch (error) {
            this.handleUnhandledError(error);
        }
    }

    render(): ReactNode {
        const { error } = this.state;

        return <>
            <div className={ classNames({ 'is-embedded': isEmbedded() }) }>
                <div className="layout optimizedCheckout-contentPrimary">
                    { this.renderContent() }
                </div>
            </div>

            <ErrorModal
                error={ error }
                onClose={ this.handleCloseErrorModal }
            />
        </>;
    }

    private renderContent(): ReactNode {
        const {
            isPending,
            loginUrl,
            promotions = [],
            steps,
        } = this.props;

        const {
            activeStepType,
            defaultStepType,
            isCartEmpty,
            isRedirecting,
        } = this.state;

        if (isCartEmpty) {
            return (
                <EmptyCartMessage
                    loginUrl={ loginUrl }
                    waitInterval={ 3000 }
                />
            );
        }

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isRedirecting }
            >
                <div className="layout-main">
                    <LoadingNotification isLoading={ isPending } />

                    <PromotionBannerList promotions={ promotions } />

                    <ol className="checkout-steps">
                        { steps
                            .filter(step => step.isRequired)
                            .map(step => this.renderStep({
                                ...step,
                                isActive: activeStepType ? activeStepType === step.type : defaultStepType === step.type,
                            })) }
                    </ol>
                </div>

                { this.renderCartSummary() }
            </LoadingOverlay>
        );
    }

    private renderStep(step: CheckoutStepStatus): ReactNode {
        switch (step.type) {
        case CheckoutStepType.Customer:
            return this.renderCustomerStep(step);

        case CheckoutStepType.Shipping:
            return this.renderShippingStep(step);

        case CheckoutStepType.Billing:
            return this.renderBillingStep(step);

        case CheckoutStepType.Payment:
            return this.renderPaymentStep(step);

        default:
            return null;
        }
    }

    private renderCustomerStep(step: CheckoutStepStatus): ReactNode {
        const {
            isGuestEnabled,
            subscribeToNewsletter,
        } = this.props;

        const {
            customerViewType = isGuestEnabled ? CustomerViewType.Guest : CustomerViewType.Login,
        } = this.state;

        return (
            <CheckoutStep
                { ...step }
                heading={ <TranslatedString id="customer.customer_heading" /> }
                key={ step.type }
                onEdit={ this.handleEditStep }
                onExpanded={ this.handleExpanded }
                summary={
                    <CustomerInfo
                        onSignOut={ this.handleSignOut }
                        onSignOutError={ this.handleError }
                    />
                }
            >
                <LazyContainer>
                    <Customer
                        checkEmbeddedSupport={ this.checkEmbeddedSupport }
                        onChangeViewType={ this.handleChangeCustomerViewType }
                        onContinueAsGuest={ this.navigateToNextIncompleteStep }
                        onContinueAsGuestError={ this.handleError }
                        onReady={ this.handleReady }
                        onSignIn={ this.navigateToNextIncompleteStep }
                        onSignInError={ this.handleError }
                        onUnhandledError={ this.handleUnhandledError }
                        subscribeToNewsletter={ subscribeToNewsletter }
                        viewType={ customerViewType }
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderShippingStep(step: CheckoutStepStatus): ReactNode {
        const {
            hasCartChanged,
            cart,
            consignments = [],
        } = this.props;

        const { isMultiShippingMode } = this.state;

        if (!cart) {
            return;
        }

        return (
            <CheckoutStep
                { ...step }
                heading={ <TranslatedString id="shipping.shipping_heading" /> }
                key={ step.type }
                onEdit={ this.handleEditStep }
                onExpanded={ this.handleExpanded }
                summary={ consignments.map(consignment =>
                    <div className="staticConsignmentContainer" key={ consignment.id }>
                        <StaticConsignment
                            cart={ cart }
                            compactView={ consignments.length < 2 }
                            consignment={ consignment }
                        />
                    </div>) }
            >
                <LazyContainer>
                    <Shipping
                        cartHasChanged={ hasCartChanged }
                        isMultiShippingMode={ isMultiShippingMode }
                        navigateNextStep={ this.handleShippingNextStep }
                        onReady={ this.handleReady }
                        onSignIn={ this.handleShippingSignIn }
                        onToggleMultiShipping={ this.handleToggleMultiShipping }
                        onUnhandledError={ this.handleUnhandledError }
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderBillingStep(step: CheckoutStepStatus): ReactNode {
        const { billingAddress } = this.props;

        return (
            <CheckoutStep
                { ...step }
                heading={ <TranslatedString id="billing.billing_heading" /> }
                key={ step.type }
                onEdit={ this.handleEditStep }
                onExpanded={ this.handleExpanded }
                summary={ billingAddress && <StaticBillingAddress address={ billingAddress } /> }
            >
                <LazyContainer>
                    <Billing
                        navigateNextStep={ this.navigateToNextIncompleteStep }
                        onReady={ this.handleReady }
                        onUnhandledError={ this.handleUnhandledError }
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderPaymentStep(step: CheckoutStepStatus): ReactNode {
        const {
            consignments,
            cart,
            flashMessages,
        } = this.props;

        return (
            <CheckoutStep
                { ...step }
                heading={ <TranslatedString id="payment.payment_heading" /> }
                key={ step.type }
                onEdit={ this.handleEditStep }
                onExpanded={ this.handleExpanded }
            >
                <LazyContainer>
                    <Payment
                        checkEmbeddedSupport={ this.checkEmbeddedSupport }
                        flashMessages={ flashMessages }
                        isEmbedded={ isEmbedded() }
                        isUsingMultiShipping={ cart && consignments ? isUsingMultiShipping(consignments, cart.lineItems) : false }
                        onCartChangedError={ this.handleCartChangedError }
                        onFinalize={ this.navigateToOrderConfirmation }
                        onReady={ this.handleReady }
                        onStoreCreditChange={ this.handleStoreCreditChange }
                        onSubmit={ this.navigateToOrderConfirmation }
                        onSubmitError={ this.handleError }
                        onUnhandledError={ this.handleUnhandledError }
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderCartSummary(): ReactNode {
        const { usableStoreCredit } = this.props;
        const { useStoreCredit } = this.state;

        return (
            <MobileView>
                { matched => {
                    if (matched) {
                        return <LazyContainer>
                            <CartSummaryDrawer
                                storeCreditAmount={ useStoreCredit ? usableStoreCredit : 0 }
                            />
                        </LazyContainer>;
                    }

                    return <aside className="layout-cart">
                        <LazyContainer>
                            <CartSummary
                                storeCreditAmount={ useStoreCredit ? usableStoreCredit : 0 }
                            />
                        </LazyContainer>
                    </aside>;
                } }
            </MobileView>
        );
    }

    private navigateToStep(type: CheckoutStepType, options?: { isDefault?: boolean }): void {
        const { clearError, error, steps } = this.props;
        const step = find(steps, { type });

        if (!step) {
            return;
        }

        if (options && options.isDefault) {
            this.setState({ defaultStepType: step.type });
        } else {
            this.setState({ activeStepType: step.type });
        }

        if (error) {
            clearError(error);
        }
    }

    private handleToggleMultiShipping: () => void = () => {
        const { isMultiShippingMode } = this.state;

        this.setState({ isMultiShippingMode: !isMultiShippingMode });
    };

    private navigateToNextIncompleteStep: (options?: { isDefault?: boolean }) => void = options => {
        const { steps } = this.props;
        const activeStepIndex = findIndex(steps, { isActive: true });
        const activeStep = activeStepIndex >= 0 && steps[activeStepIndex];

        if (!activeStep) {
            return;
        }

        const previousStep = steps[Math.max(activeStepIndex - 1, 0)];

        if (previousStep) {
            this.stepTracker.trackStepCompleted(previousStep.type);
        }

        this.navigateToStep(activeStep.type, options);
    };

    private navigateToOrderConfirmation: () => void = () => {
        const { steps } = this.props;

        this.stepTracker.trackStepCompleted(steps[steps.length - 1].type);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postComplete();
        }

        this.setState({ isRedirecting: true }, () => {
            navigateToOrderConfirmation();
        });
    };

    private checkEmbeddedSupport: (methodIds: string[]) => boolean = methodIds => {
        const { embeddedSupport } = this.props;

        return embeddedSupport.isSupported(...methodIds);
    };

    private handleCartChangedError: () => void = () => {
        this.navigateToStep(CheckoutStepType.Shipping);
    };

    private handleConsignmentsUpdated: (state: CheckoutSelectors) => void = ({ data }) => {
        const {
            hasSelectedShippingOptions: prevHasSelectedShippingOptions,
            activeStepType,
        } = this.state;

        const { steps } = this.props;

        const newHasSelectedShippingOptions = hasSelectedShippingOptions(data.getConsignments() || []);

        if (prevHasSelectedShippingOptions &&
            !newHasSelectedShippingOptions &&
            findIndex(steps, { type: CheckoutStepType.Shipping }) < findIndex(steps, { type: activeStepType })
        ) {
            this.navigateToStep(CheckoutStepType.Shipping);
            this.setState({ error: new ShippingOptionExpiredError() });
        }

        this.setState({ hasSelectedShippingOptions: newHasSelectedShippingOptions });
    };

    private handleCloseErrorModal: () => void = () => {
        this.setState({ error: undefined });
    };

    private handleChangeCustomerViewType: (viewType: CustomerViewType) => void = viewType => {
        this.setState({ customerViewType: viewType });
    };

    private handleExpanded: (type: CheckoutStepType) => void = type => {
        this.stepTracker.trackStepViewed(type);
    };

    private handleUnhandledError: (error: Error) => void = error => {
        this.handleError(error);

        // For errors that are not caught and handled by child components, we
        // handle them here by displaying a generic error modal to the shopper.
        this.setState({ error });
    };

    private handleError: (error: Error) => void = error => {
        const { errorLogger } = this.props;

        errorLogger.log(error);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postError(error);
        }
    };

    private handleEditStep: (type: CheckoutStepType) => void = type => {
        this.navigateToStep(type);
    };

    private handleReady: () => void = () => {
        this.navigateToNextIncompleteStep({ isDefault: true });
    };

    private handleSignOut: (event: CustomerSignOutEvent) => void = ({ isCartEmpty }) => {
        const { loginUrl, isGuestEnabled } = this.props;

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postSignedOut();
        }

        if (isGuestEnabled) {
            this.setState({ customerViewType: CustomerViewType.Guest });
        }

        if (isCartEmpty) {
            this.setState({ isCartEmpty: true });

            if (!isEmbedded()) {
                return window.top.location.assign(loginUrl);
            }
        }

        this.navigateToStep(CheckoutStepType.Customer);
    };

    private handleShippingNextStep: (billingSameAsShipping: boolean) => void = billingSameAsShipping => {
        if (billingSameAsShipping) {
            this.navigateToNextIncompleteStep();
        } else {
            this.navigateToStep(CheckoutStepType.Billing);
        }
    };

    private handleShippingSignIn: () => void = () => {
        this.navigateToStep(CheckoutStepType.Customer);
        this.setState({ customerViewType: CustomerViewType.Login });
    };

    private handleStoreCreditChange: (useStoreCredit: boolean) => void = (useStoreCredit = false) => {
        this.setState({ useStoreCredit });
    };
}

export default withLanguage(withCheckout(mapToCheckoutProps)(Checkout));
