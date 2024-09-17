import {
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

import { MapToPropsFactory } from '@bigcommerce/checkout/legacy-hoc';
import { CheckoutContextProps, PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { LoadingOverlay } from '../../ui/loading';
import {
    CardInstrumentFieldset,
    CreditCardValidation,
    isBankAccountInstrument,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    isInstrumentFeatureAvailable,
} from '../storedInstrument';
import withPayment, { WithPaymentProps } from '../withPayment';

export interface HostedDropInPaymentMethodProps {
    containerId: string;
    method: PaymentMethod;
    isUsingMultiShipping?: boolean;
    isInitializing?: boolean;
    hideWidget?: boolean;
    shouldHideInstrumentExpiryDate?: boolean;
    hideVerificationFields?: boolean;
    isSignInRequired?: boolean;
    validateInstrument?(shouldShowNumberField: boolean): React.ReactNode;
    deinitializeCustomer?(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
    initializeCustomer?(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrumentId?: string,
    ): Promise<CheckoutSelectors>;
    signInCustomer?(): void;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
}

interface HostedDropInPaymentMethodState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

interface WithCheckoutHostedDropInPaymentMethodProps {
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

class HostedDropInPaymentMethod extends Component<
    HostedDropInPaymentMethodProps &
        WithCheckoutHostedDropInPaymentMethodProps &
        ConnectFormikProps<PaymentFormValues> &
        WithPaymentProps
> {
    state: HostedDropInPaymentMethodState = {
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

    async componentDidUpdate(
        prevProps: Readonly<
            HostedDropInPaymentMethodProps & WithCheckoutHostedDropInPaymentMethodProps
        >,
        prevState: Readonly<HostedDropInPaymentMethodState>,
    ): Promise<void> {
        const {
            deinitializePayment = noop,
            instruments,
            method,
            onUnhandledError = noop,
            hidePaymentSubmitButton,
            isPaymentDataRequired,
        } = this.props;

        const { selectedInstrumentId, isAddingNewCard } = this.state;
        const selectedInstrument = this.getDefaultInstrumentId();

        hidePaymentSubmitButton(method, !selectedInstrument && isPaymentDataRequired);

        if (
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            (prevProps.instruments.length > 0 && instruments.length === 0) ||
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
            method,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isInitializing = false,
            isLoadingInstruments,
            hideWidget = false,
            shouldHideInstrumentExpiryDate = false,
        } = this.props;

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

        const { instruments } = this.props;
        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private getValidateInstrument(): ReactNode {
        const {
            hideVerificationFields,
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            method,
            validateInstrument,
        } = this.props;

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
            isPaymentDataRequired,
            isSignedIn,
            isSignInRequired,
            initializeCustomer = noop,
            initializePayment = noop,
            method,
            setSubmit,
            signInCustomer = noop,
            hidePaymentSubmitButton,
        } = this.props;

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

    private handleSelectInstrument: (id: string) => void = (id) => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

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
}

const mapFromCheckoutProps: MapToPropsFactory<
    CheckoutContextProps,
    WithCheckoutHostedDropInPaymentMethodProps,
    HostedDropInPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
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
    withPayment(withCheckout(mapFromCheckoutProps)(HostedDropInPaymentMethod)),
);
