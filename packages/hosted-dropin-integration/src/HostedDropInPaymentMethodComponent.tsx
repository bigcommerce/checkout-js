import {
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    CustomerInitializeOptions,
    CustomerRequestOptions,
    Instrument,
    LanguageService,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import classNames from 'classnames';
import { find, noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';

import {
    CardInstrumentFieldset,
    CreditCardValidation,
    isBankAccountInstrument,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    isInstrumentFeatureAvailable,
} from '@bigcommerce/checkout/instrument-utils';
import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface HostedDropInPaymentMethodProps {
    checkoutService: CheckoutService;
    checkoutState: CheckoutSelectors;
    containerId: string;
    hideVerificationFields?: boolean;
    hideWidget?: boolean;
    isInitializing?: boolean;
    isSignInRequired?: boolean;
    isUsingMultiShipping?: boolean;
    language: LanguageService;
    method: PaymentMethod;
    paymentForm: PaymentFormService;
    shouldHideInstrumentExpiryDate?: boolean;
    deinitializeCustomer?(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer?(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrumentId?: string,
    ): Promise<CheckoutSelectors>;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
    signInCustomer?(): void;
    validateInstrument?(shouldShowNumberField: boolean): React.ReactNode;
}

interface HostedDropInPaymentMethodState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

interface HostedDropInPaymentMethodDerivedProps {
    instruments: PaymentInstrument[];
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    isSignedIn: boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
    isInstrumentCardCodeRequired(instrument: Instrument, method: PaymentMethod): boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
    signOut(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
}

class HostedDropInPaymentMethodComponent extends Component<HostedDropInPaymentMethodProps> {
    state: HostedDropInPaymentMethodState = {
        isAddingNewCard: false,
    };

    private filterInstruments = memoizeOne((instruments: PaymentInstrument[] = []) =>
        instruments.filter(
            (instrument) => isCardInstrument(instrument) || isBankAccountInstrument(instrument),
        ),
    );

    async componentDidMount(): Promise<void> {
        const { onUnhandledError = noop } = this.props;

        const { isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp, loadInstruments } =
            this.getHostedDropInPaymentMethodDerivedProps();

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
            HostedDropInPaymentMethodProps & HostedDropInPaymentMethodDerivedProps
        >,
        prevState: Readonly<HostedDropInPaymentMethodState>,
    ): Promise<void> {
        const {
            paymentForm: { hidePaymentSubmitButton },
            deinitializePayment,
            method,
            onUnhandledError = noop,
        } = this.props;

        const { instruments, isPaymentDataRequired } = this.getHostedDropInPaymentMethodDerivedProps();

        const {
            checkoutState: {
                data: { getInstruments },
            },
        } = prevProps;
        const previnstruments = this.filterInstruments(getInstruments(method));

        const { selectedInstrumentId, isAddingNewCard } = this.state;
        const selectedInstrument = this.getDefaultInstrumentId();

        hidePaymentSubmitButton(method, !selectedInstrument && isPaymentDataRequired);

        if (
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            (previnstruments.length > 0 && instruments.length === 0) ||
            isAddingNewCard !== prevState.isAddingNewCard
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
            paymentForm: { setSubmit, setValidationSchema },
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
            containerId,
            method,
            isInitializing = false,
            hideWidget = false,
            shouldHideInstrumentExpiryDate = false,
        } = this.props;

        const {
            instruments,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
        } = this.getHostedDropInPaymentMethodDerivedProps();

        const { isAddingNewCard, selectedInstrumentId = this.getDefaultInstrumentId() } =
            this.state;

        const shouldShowInstrumentFieldset =
            isInstrumentFeatureAvailableProp && instruments.length > 0;
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;

        return (
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                {shouldShowInstrumentFieldset && (
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

                {shouldShowCreditCardFieldset && (
                    <div className="paymentMethod--hosted">
                        <div
                            className={classNames(
                                'widget',
                                `widget--${method.id}`,
                                'payment-widget',
                            )}
                            id={containerId}
                            style={{
                                display: undefined,
                            }}
                            tabIndex={-1}
                        />
                    </div>
                )}
            </LoadingOverlay>
        );
    }

    private getDefaultInstrumentId(): string | undefined {
        const { isAddingNewCard } = this.state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = this.getHostedDropInPaymentMethodDerivedProps();
        const firstInstrument = instruments[0] ? instruments[0] : undefined;
        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || firstInstrument;

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private getValidateInstrument(): ReactNode {
        const { hideVerificationFields, method, validateInstrument } = this.props;

        const {
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
        } = this.getHostedDropInPaymentMethodDerivedProps();

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;
        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowNumberField = selectedInstrument
            ? isInstrumentCardNumberRequiredProp(selectedInstrument as CardInstrument)
            : false;
        const shouldShowCardCodeField = selectedInstrument
            ? isInstrumentCardCodeRequiredProp(selectedInstrument as CardInstrument, method)
            : false;

        if (hideVerificationFields) {
            return;
        }

        if (validateInstrument) {
            return validateInstrument(shouldShowNumberField);
        }

        return (
            <CreditCardValidation
                shouldShowCardCodeField={shouldShowCardCodeField}
                shouldShowNumberField={shouldShowNumberField}
            />
        );
    }

    private async initializeMethod(): Promise<CheckoutSelectors | void> {
        const {
            isSignInRequired,
            initializeCustomer = noop,
            initializePayment,
            method,
            paymentForm: { hidePaymentSubmitButton, setSubmit },
            signInCustomer = noop,
        } = this.props;

        const { isPaymentDataRequired, isSignedIn } = this.getHostedDropInPaymentMethodDerivedProps();

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;

        if (!isPaymentDataRequired) {
            setSubmit(method, null);
            hidePaymentSubmitButton(method, false);

            return Promise.resolve();
        }

        if (isSignInRequired && !isSignedIn) {
            setSubmit(method, signInCustomer);

            return initializeCustomer({
                methodId: method.id,
            });
        }

        setSubmit(method, null);

        return initializePayment(
            {
                gatewayId: method.gateway,
                methodId: method.id,
            },
            selectedInstrumentId,
        );
    }

    private handleDeleteInstrument: (id: string) => void = (id) => {
        const {
            paymentForm: { setFieldValue },
        } = this.props;
        const { instruments } = this.getHostedDropInPaymentMethodDerivedProps();
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

    private handleSelectInstrument: (id: string) => void = (id) => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    private handleUseNewCard: () => void = async () => {
        const { deinitializePayment, initializePayment, method } = this.props;

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

    private getHostedDropInPaymentMethodDerivedProps(): HostedDropInPaymentMethodDerivedProps {
        const { checkoutService, checkoutState, isUsingMultiShipping = false, method } = this.props;

        const {
            data: { getCheckout, getConfig, getCustomer, getInstruments, isPaymentDataRequired },
            statuses: { isLoadingInstruments },
        } = checkoutState;

        const checkout = getCheckout();
        const config = getConfig();
        const customer = getCustomer();

        if (!checkout || !config || !customer) {
            throw new Error('Unable to get checkout');
        }

        return {
            instruments: this.filterInstruments(getInstruments(method)),
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
    }
}

export default HostedDropInPaymentMethodComponent;
