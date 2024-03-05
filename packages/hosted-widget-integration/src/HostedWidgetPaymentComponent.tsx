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
import classNames from 'classnames';
import { find, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import {
    AccountInstrumentFieldset,
    assertIsCardInstrument,
    CardInstrumentFieldset,
    isBankAccountInstrument,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface HostedWidgetComponentState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

export interface PaymentContextProps {
    disableSubmit(method: PaymentMethod, disabled?: boolean): void;
    // NOTE: This prop allows certain payment methods to override the default
    // form submission behaviour. It is not recommended to use it because
    // generally speaking we want to avoid method-specific snowflake behaviours.
    // Nevertheless, because of some product / UX decisions made in the past
    // (i.e.: Amazon), we have to have this backdoor so we can preserve these
    // snowflake behaviours. In the future, if we decide to change the UX, we
    // can remove this prop.
    setSubmit(method: PaymentMethod, fn: ((values: PaymentFormValues) => void) | null): void;
    setFieldValue<TField extends keyof PaymentFormValues>(
        field: TField,
        value: PaymentFormValues[TField],
    ): void;
    setValidationSchema(
        method: PaymentMethod,
        schema: ObjectSchema<Partial<PaymentFormValues>> | null,
    ): void;
    hidePaymentSubmitButton(method: PaymentMethod, hidden?: boolean): void;
}

export interface WithCheckoutHostedWidgetPaymentMethodProps {
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

export interface HostedWidgetComponentProps extends WithCheckoutHostedWidgetPaymentMethodProps {
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

interface HostedWidgetPaymentMethodState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

class HostedWidgetPaymentComponent extends Component<
    HostedWidgetComponentProps & PaymentContextProps
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
            HostedWidgetComponentProps & WithCheckoutHostedWidgetPaymentMethodProps
        >,
        prevState: Readonly<HostedWidgetPaymentMethodState>,
    ): Promise<void> {
        const {
            deinitializePayment,
            instruments,
            method,
            onUnhandledError = noop,
            setValidationSchema,
            isPaymentDataRequired,
        } = this.props;

        const { selectedInstrumentId } = this.state;

        setValidationSchema(method, this.getValidationSchema());

        if (
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            (prevProps.instruments.length > 0 && instruments.length === 0) ||
            prevProps.isPaymentDataRequired !== isPaymentDataRequired
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
            deinitializePayment,
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

            // eslint-disable-next-line @typescript-eslint/await-thenable
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
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                            instruments={instruments as AccountInstrument[]}
                            onSelectInstrument={this.handleSelectInstrument}
                            onUseNewInstrument={this.handleUseNewCard}
                            selectedInstrument={selectedAccountInstrument}
                        />
                    )}

                    {!shouldShowAccountInstrument && shouldShowInstrumentFieldset && (
                        <CardInstrumentFieldset
                            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
                            instruments={instruments}
                            isAccountInstrument={isAccountInstrument || shouldShowAccountInstrument}
                        />
                    )}

                    {this.renderEditButtonIfAvailable()}
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
        });

        if (selectedInstrument) {
            assertIsCardInstrument(selectedInstrument);

            const shouldShowNumberField = isInstrumentCardNumberRequiredProp(selectedInstrument);

            if (hideVerificationFields) {
                return;
            }

            if (validateInstrument) {
                return validateInstrument(shouldShowNumberField, selectedInstrument);
            }
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
        const { instruments, setFieldValue } = this.props;
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
        return !isAddingNewCard && isBankAccountInstrument(selectedInstrument)
            ? selectedInstrument
            : undefined;
    }

    private renderEditButtonIfAvailable() {
        const { shouldShowEditButton, buttonId } = this.props;
        const translatedString = <TranslatedString id="remote.select_different_card_action" />;

        if (shouldShowEditButton) {
            return (
                <p>
                    {
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <a
                            className={classNames('stepHeader', 'widget-link-amazonpay')}
                            id={buttonId}
                            onClick={preventDefault()}
                        >
                            {translatedString}
                        </a>
                    }
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

        const { selectedInstrumentId = this.getDefaultInstrumentId(), isAddingNewCard } =
            this.state;

        let selectedInstrument;

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

        if (!isAddingNewCard) {
            selectedInstrument =
                instruments.find((instrument) => instrument.bigpayToken === selectedInstrumentId) ||
                instruments[0];
        }

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
        const { deinitializePayment, initializePayment = noop, method } = this.props;

        this.setState({
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });

        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });

        // eslint-disable-next-line @typescript-eslint/await-thenable
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
}

export default HostedWidgetPaymentComponent;
