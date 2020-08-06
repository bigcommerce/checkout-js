import { AccountInstrument, CardInstrument, CheckoutSelectors, CustomerInitializeOptions, CustomerRequestOptions, Instrument, PaymentInitializeOptions, PaymentInstrument, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import classNames from 'classnames';
import { find, noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { preventDefault } from '../../common/dom';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { MapToProps } from '../../common/hoc';
import { TranslatedString } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import { isBankAccountInstrument, isCardInstrument, isInstrumentCardCodeRequiredSelector, isInstrumentCardNumberRequiredSelector, isInstrumentFeatureAvailable, AccountInstrumentFieldset, CardInstrumentFieldset, CreditCardValidation } from '../storedInstrument';
import withPayment, { WithPaymentProps } from '../withPayment';
import { PaymentFormValues } from '../PaymentForm';

import SignOutLink from './SignOutLink';
import StoreInstrumentFieldset from './StoreInstrumentFieldset';

export interface HostedWidgetPaymentMethodProps {
    additionalContainerClassName?: string;
    buttonId?: string;
    containerId: string;
    hideContentWhenSignedOut?: boolean;
    hideVerificationFields?: boolean;
    isAccountInstrument?: boolean;
    hideWidget?: boolean;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    isSignInRequired?: boolean;
    method: PaymentMethod;
    paymentDescriptor?: string;
    shouldHideInstrumentExpiryDate?: boolean;
    shouldShowDescriptor?: boolean;
    shouldShowEditButton?: boolean;
    validateInstrument?(shouldShowNumberField: boolean, shouldShowMakeDefaultOption: boolean): React.ReactNode;
    deinitializeCustomer?(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer?(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions, selectedInstrumentId?: string): Promise<CheckoutSelectors>;
    onPaymentSelect?(): void;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
    signInCustomer?(): void;
}

interface WithCheckoutHostedWidgetPaymentMethodProps {
    hasAnyInstruments: boolean;
    instruments: PaymentInstrument[];
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    isSignedIn: boolean;
    isInstrumentCardCodeRequired(instrument: Instrument, method: PaymentMethod): boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
    signOut(options: CustomerRequestOptions): void;
}

interface HostedWidgetPaymentMethodState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

class HostedWidgetPaymentMethod extends Component<
    HostedWidgetPaymentMethodProps &
    WithCheckoutHostedWidgetPaymentMethodProps &
    ConnectFormikProps<PaymentFormValues> &
    WithPaymentProps
> {
    state: HostedWidgetPaymentMethodState = {
        isAddingNewCard: false,
    };

    async componentDidMount(): Promise<void> {
        const {
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            loadInstruments,
            onUnhandledError = noop,
        } = this.props;

        try {
            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }

            await this.initializeMethod();
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentDidUpdate(prevProps: Readonly<HostedWidgetPaymentMethodProps & WithCheckoutHostedWidgetPaymentMethodProps>, prevState: Readonly<HostedWidgetPaymentMethodState>): Promise<void> {
        const {
            deinitializePayment = noop,
            instruments,
            method,
            onUnhandledError = noop,
        } = this.props;

        const {
            selectedInstrumentId,
        } = this.state;

        if (selectedInstrumentId !== prevState.selectedInstrumentId ||
            (prevProps.instruments.length > 0 && instruments.length === 0)) {
            try {
                await deinitializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });
                await this.initializeMethod();
            } catch (error) {
                onUnhandledError(error);
            }
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializeCustomer = noop,
            deinitializePayment = noop,
            method,
            onUnhandledError = noop,
            setSubmit,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, null);
        setSubmit(method, null);

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });

            await deinitializeCustomer({
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    render(): ReactNode {
        const {
            instruments,
            containerId,
            hideContentWhenSignedOut = false,
            hideWidget = false,
            isInitializing = false,
            isSignedIn = false,
            isSignInRequired = false,
            method,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
            additionalContainerClassName,
            shouldHideInstrumentExpiryDate = false,
        } = this.props;

        const {
            isAddingNewCard,
            selectedInstrumentId = this.getInitiallySelectedInstrumentId(),
        } = this.state;

        const selectedInstrument = instruments.find(instrument => instrument.bigpayToken === selectedInstrumentId) || instruments[0];

        const shouldShowInstrumentFieldset = isInstrumentFeatureAvailableProp && instruments.length > 0;
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const shouldShowSaveInstrument = isInstrumentFeatureAvailableProp && shouldShowCreditCardFieldset;
        const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;

        const selectedAccountInstrument = this.getSelectedBankAccountInstrument(isAddingNewCard, selectedInstrument);
        const shouldShowAccountInstrument = instruments[0] && isBankAccountInstrument(instruments[0]);

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isLoading }
            >
                <div className="paymentMethod--hosted">
                    { shouldShowAccountInstrument && shouldShowInstrumentFieldset && <AccountInstrumentFieldset
                        instruments={ instruments as AccountInstrument[] }
                        onSelectInstrument={ this.handleSelectInstrument }
                        onUseNewInstrument={ this.handleUseNewCard }
                        selectedInstrument={ selectedAccountInstrument }
                    /> }

                    { !shouldShowAccountInstrument && shouldShowInstrumentFieldset && <CardInstrumentFieldset
                        instruments={ instruments as CardInstrument[] }
                        onSelectInstrument={ this.handleSelectInstrument }
                        onUseNewInstrument={ this.handleUseNewCard }
                        selectedInstrumentId={ selectedInstrumentId }
                        shouldHideExpiryDate={ shouldHideInstrumentExpiryDate }
                        validateInstrument={ this.getValidateInstrument() }
                    /> }

                    { this.renderPaymentDescriptorIfAvailable() }

                    <div
                        className={ classNames(
                            'widget',
                            `widget--${method.id}`,
                            'payment-widget',
                            additionalContainerClassName
                        ) }
                        id={ containerId }
                        style={ {
                            display: (hideContentWhenSignedOut && isSignInRequired && !isSignedIn) || !shouldShowCreditCardFieldset || hideWidget ? 'none' : undefined,
                        } }
                        tabIndex={ -1 }
                    />

                    { shouldShowSaveInstrument && this.renderStoreInstrumentFieldSet() }

                    { this.renderEditButtonIfAvailable() }

                    { isSignedIn && <SignOutLink
                        method={ method }
                        onSignOut={ this.handleSignOut }
                    /> }
                </div>
            </LoadingOverlay>
        );
    }

    getValidateInstrument(): ReactNode | undefined {
        const {
            hasAnyInstruments,
            hideVerificationFields,
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            method,
            validateInstrument,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        } = this.props;

        const {
            selectedInstrumentId = this.getInitiallySelectedInstrumentId(),
            isAddingNewCard,
        } = this.state;
        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowNumberField = selectedInstrument ? isInstrumentCardNumberRequiredProp(selectedInstrument as CardInstrument) : false;
        const shouldShowCardCodeField = selectedInstrument ? isInstrumentCardCodeRequiredProp(selectedInstrument as CardInstrument, method) : false;
        const selectedInstrumentIsDefault = selectedInstrument && selectedInstrument.defaultInstrument;
        const shouldShowSetCardAsDefault = hasAnyInstruments && isInstrumentFeatureAvailableProp && (!isAddingNewCard && !selectedInstrumentIsDefault);

        if (hideVerificationFields) {
            return;
        }

        if (validateInstrument) {
            return validateInstrument(shouldShowNumberField, shouldShowSetCardAsDefault);
        }

        return (
            <CreditCardValidation
                shouldShowCardCodeField={ shouldShowCardCodeField }
                shouldShowNumberField={ shouldShowNumberField }
                shouldShowSetCardAsDefault={ shouldShowSetCardAsDefault }
            />
        );
    }

    private getSelectedBankAccountInstrument(isAddingNewCard: boolean, selectedInstrument: PaymentInstrument): AccountInstrument | undefined {
        return !isAddingNewCard && selectedInstrument && isBankAccountInstrument(selectedInstrument) ? selectedInstrument : undefined;
    }

    private renderEditButtonIfAvailable() {
        const { shouldShowEditButton, buttonId } = this.props;
        const translatedString = <TranslatedString id="remote.select_different_card_action" />;

        if (shouldShowEditButton) {
            return (
                <p>
                    <a
                        className={ classNames('stepHeader', 'widget-link-amazonpay') }
                        id={ buttonId }
                        onClick={ preventDefault() }
                    >
                        { translatedString }
                    </a>
                </p>
            );
        }
    }

    private renderPaymentDescriptorIfAvailable() {
        const { shouldShowDescriptor, paymentDescriptor } = this.props;

        if (shouldShowDescriptor && paymentDescriptor) {
            return(
                <div className="payment-descriptor">{ paymentDescriptor }</div>
            );
        }
    }

    private renderStoreInstrumentFieldSet(): ReactNode {
        const {
            hasAnyInstruments,
            instruments,
            isAccountInstrument,
        } = this.props;
        const {
            selectedInstrumentId,
        } = this.state;

        const selectedInstrument = selectedInstrumentId && instruments.find(instrument => instrument.bigpayToken === selectedInstrumentId);
        const selectedInstrumentIsDefault = selectedInstrument && selectedInstrument.defaultInstrument;
        const showSetAsDefault = hasAnyInstruments && !selectedInstrumentIsDefault;

        return <StoreInstrumentFieldset isAccountInstrument={ Boolean(isAccountInstrument) } showSave={ true } showSetAsDefault={ showSetAsDefault } />;
    }

    private async initializeMethod(): Promise<CheckoutSelectors | void> {
        const {
            isPaymentDataRequired,
            isSignedIn,
            isSignInRequired,
            initializeCustomer = noop,
            initializePayment = noop,
            method,
            setSubmit,
            signInCustomer = noop,
        } = this.props;

        const { selectedInstrumentId = this.getInitiallySelectedInstrumentId() } = this.state;

        if (!isPaymentDataRequired) {
            setSubmit(method, null);

            return Promise.resolve();
        }

        if (isSignInRequired && !isSignedIn) {
            setSubmit(method, signInCustomer);

            return initializeCustomer({
                methodId: method.id,
            });
        }

        setSubmit(method, null);

        return initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        }, selectedInstrumentId);
    }

    private getInitiallySelectedInstrumentId(): string | undefined {
        const { isAddingNewCard } = this.state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = this.props;
        const defaultInstrument = (
            instruments.find(instrument => instrument.defaultInstrument) ||
            instruments[0]
        );

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private handleUseNewCard: () => void = async () => {
        const {
            deinitializePayment = noop,
            initializePayment = noop,
            method,
        } = this.props;

        this.setState({
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });

        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    };

    private handleSelectInstrument: (id: string) => void = id => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    private handleSignOut: () => void = async () => {
        const {
            method,
            onSignOut = noop,
            onSignOutError = noop,
            signOut,
        } = this.props;

        try {
            await signOut({ methodId: method.id });
            onSignOut();
        } catch (error) {
            onSignOutError(error);
        }
    };
}

function mapFromCheckoutProps(): MapToProps<
    CheckoutContextProps,
    WithCheckoutHostedWidgetPaymentMethodProps,
    HostedWidgetPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
> {
    const filterInstruments = memoizeOne((instruments: PaymentInstrument[] = []) => instruments.filter( instrument => isCardInstrument(instrument) || isBankAccountInstrument(instrument)));

    return (context, props) => {

        const {
            isUsingMultiShipping = false,
            method,
        } = props;

        const { checkoutService, checkoutState } = context;

        const {
            data: {
                getCheckout,
                getConfig,
                getCustomer,
                getInstruments,
                isPaymentDataRequired,
            },
            statuses: {
                isLoadingInstruments,
            },
        } = checkoutState;

        const checkout = getCheckout();
        const config = getConfig();
        const customer = getCustomer();

        if (!checkout || !config || !customer || !method) {
            return null;
        }

        const allInstruments = getInstruments();

        return {
            hasAnyInstruments: !!allInstruments && allInstruments.length > 0,
            instruments: filterInstruments(getInstruments(method)),
            isLoadingInstruments: isLoadingInstruments(),
            isPaymentDataRequired: isPaymentDataRequired(),
            isSignedIn: some(checkout.payments, { providerId: method.id }),
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredSelector(checkoutState),
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailable({
                config,
                customer,
                isUsingMultiShipping,
                paymentMethod: method,
            }),
            loadInstruments: checkoutService.loadInstruments,
            signOut: checkoutService.signOutCustomer,
        };
    };
}

export default connectFormik(withPayment(withCheckout(mapFromCheckoutProps)(HostedWidgetPaymentMethod)));
