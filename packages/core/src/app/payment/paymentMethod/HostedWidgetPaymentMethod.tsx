import {
    AccountInstrument,
    CardInstrument,
    CheckoutSelectors,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    Instrument,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import classNames from 'classnames';
import { find, noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { CheckoutContextProps, withCheckout } from '../../checkout';
import { preventDefault } from '../../common/dom';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { MapToPropsFactory } from '../../common/hoc';
import { TranslatedString } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import {
    AccountInstrumentFieldset,
    CardInstrumentFieldset,
    isBankAccountInstrument,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    isInstrumentFeatureAvailable,
} from '../storedInstrument';
import StoreInstrumentFieldset from '../StoreInstrumentFieldset';
import withPayment, { WithPaymentProps } from '../withPayment';

import SignOutLink from './SignOutLink';

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
    shouldShow?: boolean;
    shouldShowDescriptor?: boolean;
    shouldShowEditButton?: boolean;
    shouldRenderCustomInstrument?: boolean;
    storedCardValidationSchema?: ObjectSchema;
    renderCustomPaymentForm?(): React.ReactNode;
    validateInstrument?(
        shouldShowNumberField: boolean,
        selectedInstrument?: CardInstrument,
    ): React.ReactNode;
    deinitializeCustomer?(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer?(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrument?: CardInstrument,
    ): Promise<CheckoutSelectors>;
    onPaymentSelect?(): void;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
    signInCustomer?(): void;
}

interface WithCheckoutHostedWidgetPaymentMethodProps {
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
            method,
            onUnhandledError = noop,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, this.getValidationSchema());

        try {
            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }

            await this.initializeMethod();
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentDidUpdate(
        prevProps: Readonly<
            HostedWidgetPaymentMethodProps & WithCheckoutHostedWidgetPaymentMethodProps
        >,
        prevState: Readonly<HostedWidgetPaymentMethodState>,
    ): Promise<void> {
        const {
            deinitializePayment = noop,
            instruments,
            method,
            onUnhandledError = noop,
            setValidationSchema,
        } = this.props;

        const { selectedInstrumentId } = this.state;

        setValidationSchema(method, this.getValidationSchema());

        if (
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            (prevProps.instruments.length > 0 && instruments.length === 0)
        ) {
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
            hideWidget = false,
            isInitializing = false,
            isSignedIn = false,
            method,
            isAccountInstrument,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
            shouldHideInstrumentExpiryDate = false,
            shouldShow = true,
        } = this.props;

        const { isAddingNewCard, selectedInstrumentId = this.getDefaultInstrumentId() } =
            this.state;

        if (!shouldShow) {
            return null;
        }

        const selectedInstrument =
            instruments.find((instrument) => instrument.bigpayToken === selectedInstrumentId) ||
            instruments[0];

        const shouldShowInstrumentFieldset =
            isInstrumentFeatureAvailableProp && instruments.length > 0;
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;

        const selectedAccountInstrument = this.getSelectedBankAccountInstrument(
            isAddingNewCard,
            selectedInstrument,
        );
        const shouldShowAccountInstrument =
            instruments[0] && isBankAccountInstrument(instruments[0]);

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <div className="paymentMethod--hosted">
                    {shouldShowAccountInstrument && shouldShowInstrumentFieldset && (
                        <AccountInstrumentFieldset
                            instruments={instruments as AccountInstrument[]}
                            onSelectInstrument={this.handleSelectInstrument}
                            onUseNewInstrument={this.handleUseNewCard}
                            selectedInstrument={selectedAccountInstrument}
                        />
                    )}

                    {!shouldShowAccountInstrument && shouldShowInstrumentFieldset && (
                        <CardInstrumentFieldset
                            instruments={instruments as CardInstrument[]}
                            onDeleteInstrument={this.handleDeleteInstrument}
                            onSelectInstrument={this.handleSelectInstrument}
                            onUseNewInstrument={this.handleUseNewCard}
                            selectedInstrumentId={selectedInstrumentId}
                            shouldHideExpiryDate={shouldHideInstrumentExpiryDate}
                            validateInstrument={this.getValidateInstrument()}
                        />
                    )}

                    {this.renderPaymentDescriptorIfAvailable()}

                    {this.renderContainer(shouldShowCreditCardFieldset)}

                    {isInstrumentFeatureAvailableProp && (
                        <StoreInstrumentFieldset
                            instrumentId={selectedInstrumentId}
                            isAccountInstrument={isAccountInstrument || shouldShowAccountInstrument}
                        />
                    )}

                    {this.renderEditButtonIfAvailable()}

                    {isSignedIn && <SignOutLink method={method} onSignOut={this.handleSignOut} />}
                </div>
            </LoadingOverlay>
        );
    }

    getValidateInstrument(): ReactNode {
        const {
            hideVerificationFields,
            instruments,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            validateInstrument,
        } = this.props;

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;
        const selectedInstrument = find(instruments, {
            bigpayToken: selectedInstrumentId,
        }) as CardInstrument;
        const shouldShowNumberField = selectedInstrument
            ? isInstrumentCardNumberRequiredProp(selectedInstrument)
            : false;

        if (hideVerificationFields) {
            return;
        }

        if (validateInstrument) {
            return validateInstrument(shouldShowNumberField, selectedInstrument);
        }
    }

    renderContainer(shouldShowCreditCardFieldset: any): ReactNode {
        const {
            containerId,
            hideContentWhenSignedOut = false,
            hideWidget,
            isSignInRequired = false,
            isSignedIn,
            method,
            additionalContainerClassName,
            shouldRenderCustomInstrument = false,
            renderCustomPaymentForm,
        } = this.props;

        return (
            <div
                className={classNames(
                    'widget',
                    `widget--${method.id}`,
                    'payment-widget',
                    shouldRenderCustomInstrument ? '' : additionalContainerClassName,
                )}
                id={containerId}
                style={{
                    display:
                        (hideContentWhenSignedOut && isSignInRequired && !isSignedIn) ||
                        !shouldShowCreditCardFieldset ||
                        hideWidget
                            ? 'none'
                            : undefined,
                }}
                tabIndex={-1}
            >
                {shouldRenderCustomInstrument &&
                    renderCustomPaymentForm &&
                    renderCustomPaymentForm()}
            </div>
        );
    }

    private getValidationSchema(): ObjectSchema | null {
        const {
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isPaymentDataRequired,
            storedCardValidationSchema,
        } = this.props;

        if (!isPaymentDataRequired) {
            return null;
        }

        const selectedInstrument = this.getSelectedInstrument();

        if (isInstrumentFeatureAvailableProp && selectedInstrument) {
            return storedCardValidationSchema || null;
        }

        return null;
    }

    private getSelectedInstrument(): PaymentInstrument | undefined {
        const { instruments } = this.props;
        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;

        return find(instruments, { bigpayToken: selectedInstrumentId });
    }

    private handleDeleteInstrument: (id: string) => void = (id) => {
        const {
            instruments,
            formik: { setFieldValue },
        } = this.props;
        const { selectedInstrumentId } = this.state;

        if (instruments.length === 0) {
            this.setState({
                isAddingNewCard: true,
                selectedInstrumentId: undefined,
            });

            setFieldValue('instrumentId', '');
        } else if (selectedInstrumentId === id) {
            this.setState({
                selectedInstrumentId: this.getDefaultInstrumentId(),
            });

            setFieldValue('instrumentId', this.getDefaultInstrumentId());
        }
    };

    private getSelectedBankAccountInstrument(
        isAddingNewCard: boolean,
        selectedInstrument: PaymentInstrument,
    ): AccountInstrument | undefined {
        return !isAddingNewCard && selectedInstrument && isBankAccountInstrument(selectedInstrument)
            ? selectedInstrument
            : undefined;
    }

    private renderEditButtonIfAvailable() {
        const { shouldShowEditButton, buttonId } = this.props;
        const translatedString = <TranslatedString id="remote.select_different_card_action" />;

        if (shouldShowEditButton) {
            return (
                <p>
                    <a
                        className={classNames('stepHeader', 'widget-link-amazonpay')}
                        id={buttonId}
                        onClick={preventDefault()}
                    >
                        {translatedString}
                    </a>
                </p>
            );
        }
    }

    private renderPaymentDescriptorIfAvailable() {
        const { shouldShowDescriptor, paymentDescriptor } = this.props;

        if (shouldShowDescriptor && paymentDescriptor) {
            return <div className="payment-descriptor">{paymentDescriptor}</div>;
        }
    }

    private async initializeMethod(): Promise<CheckoutSelectors | void> {
        const {
            isPaymentDataRequired,
            isSignedIn,
            isSignInRequired,
            initializeCustomer = noop,
            initializePayment = noop,
            instruments,
            method,
            setSubmit,
            signInCustomer = noop,
        } = this.props;

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;

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

        const selectedInstrument =
            instruments.find((instrument) => instrument.bigpayToken === selectedInstrumentId) ||
            instruments[0];

        return initializePayment(
            {
                gatewayId: method.gateway,
                methodId: method.id,
            },
            selectedInstrument,
        );
    }

    private getDefaultInstrumentId(): string | undefined {
        const { isAddingNewCard } = this.state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = this.props;
        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private handleUseNewCard: () => void = async () => {
        const { deinitializePayment = noop, initializePayment = noop, method } = this.props;

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

    private handleSelectInstrument: (id: string) => void = (id) => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    private handleSignOut: () => void = async () => {
        const { method, onSignOut = noop, onSignOutError = noop, signOut } = this.props;

        try {
            await signOut({ methodId: method.id });
            onSignOut();
        } catch (error) {
            onSignOutError(error);
        }
    };
}

const mapFromCheckoutProps: MapToPropsFactory<
    CheckoutContextProps,
    WithCheckoutHostedWidgetPaymentMethodProps,
    HostedWidgetPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
> = () => {
    const filterInstruments = memoizeOne((instruments: PaymentInstrument[] = []) =>
        instruments.filter(
            (instrument) => isCardInstrument(instrument) || isBankAccountInstrument(instrument),
        ),
    );

    return (context, props) => {
        const { isUsingMultiShipping = false, method } = props;

        const { checkoutService, checkoutState } = context;

        const {
            data: { getCheckout, getConfig, getCustomer, getInstruments, isPaymentDataRequired },
            statuses: { isLoadingInstruments },
        } = checkoutState;

        const checkout = getCheckout();
        const config = getConfig();
        const customer = getCustomer();

        if (!checkout || !config || !customer || !method) {
            return null;
        }

        return {
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
};

export default connectFormik(
    withPayment(withCheckout(mapFromCheckoutProps)(HostedWidgetPaymentMethod)),
);
