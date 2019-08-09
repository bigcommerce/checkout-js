import { CheckoutSelectors, Instrument, PaymentInitializeOptions, PaymentMethod, PaymentRequestOptions } from '@bigcommerce/checkout-sdk';
import { find, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { EMPTY_ARRAY } from '../../common/utility';
import { withLanguage, WithLanguageProps } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';
import { configureCardValidator, getCreditCardValidationSchema, CreditCardFieldset, CreditCardFieldsetValues } from '../creditCard';
import { getInstrumentValidationSchema, isInstrumentCardCodeRequired, isInstrumentCardNumberRequiredSelector, isInstrumentFeatureAvailable, InstrumentFieldset, InstrumentFieldsetValues } from '../storedInstrument';
import withPayment, { WithPaymentProps } from '../withPayment';
import { PaymentFormValues } from '../PaymentForm';

export interface CreditCardPaymentMethodProps {
    isInitializing?: boolean;
    method: PaymentMethod;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    initializePayment(options: PaymentInitializeOptions): Promise<CheckoutSelectors>;
    onUnhandledError?(error: Error): void;
}

export type CreditCardPaymentMethodValues = CreditCardFieldsetValues | InstrumentFieldsetValues;

interface WithCheckoutCreditCardPaymentMethodProps {
    instruments: Instrument[];
    isInstrumentCardCodeRequired: boolean;
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

interface CreditCardPaymentMethodState {
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

class CreditCardPaymentMethod extends Component<
    CreditCardPaymentMethodProps & WithCheckoutCreditCardPaymentMethodProps & WithPaymentProps & WithLanguageProps & ConnectFormikProps<PaymentFormValues>,
    CreditCardPaymentMethodState
> {
    state: CreditCardPaymentMethodState = {
        isAddingNewCard: false,
    };

    async componentDidMount(): Promise<void> {
        const {
            initializePayment,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            loadInstruments,
            method,
            onUnhandledError = noop,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, this.getValidationSchema());
        configureCardValidator();

        try {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });

            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }
        } catch (error) {
            onUnhandledError(error);
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializePayment,
            method,
            onUnhandledError = noop,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, null);

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            onUnhandledError(error);
        }
    }

    componentDidUpdate(): void {
        const {
            method,
            setValidationSchema,
        } = this.props;

        setValidationSchema(method, this.getValidationSchema());
    }

    render(): ReactNode {
        const {
            instruments,
            isInitializing,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
            method,
        } = this.props;

        const {
            isAddingNewCard,
            selectedInstrumentId = this.getDefaultInstrumentId(),
        } = this.state;

        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });
        const shouldShowInstrumentFieldset = isInstrumentFeatureAvailableProp && instruments.length > 0;
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = isInitializing || isLoadingInstruments;

        return (
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ isLoading }
            >
                <div className="paymentMethod paymentMethod--creditCard">
                    { shouldShowInstrumentFieldset && <InstrumentFieldset
                        instruments={ instruments }
                        method={ method }
                        shouldShowCardCodeField={ isInstrumentCardCodeRequiredProp }
                        shouldShowNumberField={ selectedInstrument ? isInstrumentCardNumberRequiredProp(selectedInstrument) : false }
                        selectedInstrumentId={ selectedInstrumentId }
                        onUseNewCard={ this.handleUseNewCard }
                        onSelectInstrument={ this.handleSelectInstrument }
                    /> }

                    { shouldShowCreditCardFieldset && <CreditCardFieldset
                        shouldShowCardCodeField={ method.config.cardCode || method.config.cardCode === null }
                        shouldShowCustomerCodeField={ method.config.requireCustomerCode }
                        shouldShowSaveCardField={ isInstrumentFeatureAvailableProp }
                    /> }
                </div>
            </LoadingOverlay>
        );
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

    private getValidationSchema(): ObjectSchema<CreditCardPaymentMethodValues> | null {
        const {
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isPaymentDataRequired,
            language,
            method,
        } = this.props;

        if (!isPaymentDataRequired) {
            return null;
        }

        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;
        const selectedInstrument = find(instruments, { bigpayToken: selectedInstrumentId });

        return isInstrumentFeatureAvailableProp && selectedInstrument ?
            getInstrumentValidationSchema({
                instrumentBrand: selectedInstrument.brand,
                instrumentLast4: selectedInstrument.last4,
                isCardCodeRequired: isInstrumentCardCodeRequiredProp,
                isCardNumberRequired: isInstrumentCardNumberRequiredProp(selectedInstrument),
                language,
            }) :
            getCreditCardValidationSchema({
                isCardCodeRequired: method.config.cardCode === true,
                language,
            });
    }

    private handleUseNewCard: () => void = () => {
        this.setState({
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });
    };

    private handleSelectInstrument: (id: string) => void = id => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };
}

function mapFromCheckoutProps(
    { checkoutService, checkoutState }: CheckoutContextProps,
    { method, formik: { values } }: CreditCardPaymentMethodProps & ConnectFormikProps<PaymentFormValues>
): WithCheckoutCreditCardPaymentMethodProps | null {
    const {
        data: {
            getCart,
            getConfig,
            getConsignments,
            getCustomer,
            getInstruments,
            isPaymentDataRequired,
        },
        statuses: {
            isLoadingInstruments,
        },
    } = checkoutState;

    const cart = getCart();
    const config = getConfig();
    const consignments = getConsignments() || EMPTY_ARRAY;
    const customer = getCustomer();
    const instruments = getInstruments() || EMPTY_ARRAY;

    if (!config || !cart || !customer || !method) {
        return null;
    }

    return {
        instruments: instruments.filter(({ provider }) => provider === method.id),
        isInstrumentCardCodeRequired: isInstrumentCardCodeRequired({
            config,
            lineItems: cart.lineItems,
            paymentMethod: method,
        }),
        isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
        isInstrumentFeatureAvailable: isInstrumentFeatureAvailable({
            config,
            consignments,
            customer,
            lineItems: cart.lineItems,
            paymentMethod: method,
        }),
        isLoadingInstruments: isLoadingInstruments(),
        isPaymentDataRequired: isPaymentDataRequired(values.useStoreCredit),
        loadInstruments: checkoutService.loadInstruments,
    };
}

export default connectFormik(withLanguage(withPayment(withCheckout(mapFromCheckoutProps)(CreditCardPaymentMethod))));
