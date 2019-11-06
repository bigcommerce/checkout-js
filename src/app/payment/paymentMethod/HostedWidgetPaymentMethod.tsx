import { CardInstrument, CheckoutSelectors, CustomerInitializeOptions, CustomerRequestOptions, Instrument, PaymentInitializeOptions, PaymentInstrument, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import classNames from 'classnames';
import { find, noop, some } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { MapToProps } from '../../common/hoc';
import { LoadingOverlay } from '../../ui/loading';
import { CreditCardStorageField } from '../creditCard';
import { isCardInstrument, isInstrumentCardCodeRequired, isInstrumentCardNumberRequiredSelector, isInstrumentFeatureAvailable, CardInstrumentFieldset, CreditCardValidation } from '../storedInstrument';
import withPayment, { WithPaymentProps } from '../withPayment';
import { PaymentFormValues } from '../PaymentForm';

import SignOutLink from './SignOutLink';

export interface HostedWidgetPaymentMethodProps {
    containerId: string;
    hideContentWhenSignedOut?: boolean;
    hideVerificationFields?: boolean;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    isSignInRequired?: boolean;
    method: PaymentMethod;
    deinitializeCustomer?(options: CustomerRequestOptions): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializeCustomer?(options: CustomerInitializeOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onPaymentSelect?(): void;
    onSignOut?(): void;
    onSignOutError?(error: Error): void;
    onUnhandledError?(error: Error): void;
    signInCustomer?(): void;
}

interface WithCheckoutHostedWidgetPaymentMethodProps {
    instruments: CardInstrument[];
    isInstrumentCardCodeRequired: boolean;
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    isSignedIn: boolean;
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

    async componentDidUpdate(): Promise<void> {
        const { onUnhandledError = noop } = this.props;

        try {
            await this.initializeMethod();
        } catch (error) {
            onUnhandledError(error);
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
            hideVerificationFields = false,
            isInitializing = false,
            isSignedIn = false,
            isSignInRequired = false,
            method,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
        } = this.props;

        const {
            isAddingNewCard,
            selectedInstrumentId = this.getDefaultInstrumentId(),
        } = this.state;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowInstrumentFieldset = isInstrumentFeatureAvailableProp && instruments.length > 0;
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = isInitializing || isLoadingInstruments;
        const shouldShowNumberField = selectedInstrument ? isInstrumentCardNumberRequiredProp(selectedInstrument) : false;

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isLoading }
            >
                { shouldShowInstrumentFieldset && <CardInstrumentFieldset
                    instruments={ instruments }
                    onSelectInstrument={ this.handleSelectInstrument }
                    onUseNewInstrument={ this.handleUseNewCard }
                    selectedInstrumentId={ selectedInstrumentId }
                    validateInstrument={ <CreditCardValidation
                        shouldShowCardCodeField={ !hideVerificationFields && isInstrumentCardCodeRequiredProp }
                        shouldShowNumberField={ !hideVerificationFields && shouldShowNumberField }
                    /> }
                /> }

                <div
                    className={ classNames(
                        'widget',
                        `widget--${method.id}`,
                        'payment-widget'
                    ) }
                    id={ containerId }
                    style={ {
                        display: (hideContentWhenSignedOut && isSignInRequired && !isSignedIn) || !shouldShowCreditCardFieldset ? 'none' : undefined,
                    } }
                    tabIndex={ -1 }
                />

                { shouldShowCreditCardFieldset && isInstrumentFeatureAvailableProp && <CreditCardStorageField name="shouldSaveInstrument" /> }

                { isSignedIn && <SignOutLink
                    method={ method }
                    onSignOut={ this.handleSignOut }
                /> }
            </LoadingOverlay>
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
        } = this.props;

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
        });
    }

    private getDefaultInstrumentId(): string | undefined {
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
    const filterInstruments = memoizeOne((instruments: PaymentInstrument[] = []) => instruments.filter(isCardInstrument));

    return (context, props) => {

        const {
            formik: { values },
            isUsingMultiShipping = false,
            method,
        } = props;

        const { checkoutService, checkoutState } = context;

        const {
            data: {
                getCart,
                getCheckout,
                getConfig,
                getCustomer,
                getInstruments,
                getOrder,
                isPaymentDataRequired,
            },
            statuses: {
                isLoadingInstruments,
            },
        } = checkoutState;

        const cart = getCart();
        const checkout = getCheckout();
        const config = getConfig();
        const customer = getCustomer();
        const order = getOrder();

        if (!checkout || !config || !cart || !customer || !method) {
            return null;
        }

        const orderIsComplete = order ? order.isComplete : false;

        return {
            instruments: filterInstruments(getInstruments(method)),
            isLoadingInstruments: isLoadingInstruments(),
            isPaymentDataRequired: isPaymentDataRequired(values.useStoreCredit),
            isSignedIn: some(checkout.payments, { providerId: method.id }),
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequired({
                config,
                lineItems: cart.lineItems,
                paymentMethod: method,
            }),
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailable({
                config,
                customer,
                isUsingMultiShipping,
                paymentMethod: method,
                orderIsComplete,
            }),
            loadInstruments: checkoutService.loadInstruments,
            signOut: checkoutService.signOutCustomer,
        };
    };
}

export default connectFormik(withPayment(withCheckout(mapFromCheckoutProps)(HostedWidgetPaymentMethod)));
