import {
    CardInstrument,
    CheckoutSelectors,
    HostedFieldType,
    HostedFormOptions,
    Instrument,
    PaymentInitializeOptions,
    PaymentInstrument,
    PaymentMethod,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import {
    CardInstrumentFieldset,
    configureCardValidator,
    CreditCardFieldset,
    CreditCardFieldsetValues,
    CreditCardValidation,
    getCreditCardValidationSchema,
    getInstrumentValidationSchema,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    isInstrumentFeatureAvailable,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import {
    CardInstrumentFieldsetValues,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface CreditCardPaymentMethodProps {
    cardFieldset?: ReactNode;
    cardValidationSchema?: ObjectSchema;
    isInitializing?: boolean;
    isUsingMultiShipping?: boolean;
    storedCardValidationSchema?: ObjectSchema;
    initializePayment(
        options: PaymentInitializeOptions,
        selectedInstrument?: CardInstrument,
    ): Promise<CheckoutSelectors>;
    deinitializePayment(options: PaymentRequestOptions): Promise<CheckoutSelectors>;
    getHostedFormOptions?(
        selectedInstrument?: CardInstrument | undefined,
    ): Promise<HostedFormOptions>;
    getStoredCardValidationFieldset?(selectedInstrument?: CardInstrument): ReactNode;
}

interface CreditCardPaymentMethodDerivedProps {
    instruments: CardInstrument[];
    isCardCodeRequired: boolean;
    isCustomerCodeRequired: boolean;
    isInstrumentFeatureAvailable: boolean;
    isLoadingInstruments: boolean;
    isPaymentDataRequired: boolean;
    shouldShowInstrumentFieldset: boolean;
    isInstrumentCardCodeRequired(instrument: Instrument, method: PaymentMethod): boolean;
    isInstrumentCardNumberRequired(instrument: Instrument): boolean;
    loadInstruments(): Promise<CheckoutSelectors>;
}

interface CreditCardPaymentMethodState {
    focusedHostedFieldType?: HostedFieldType;
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

export type CreditCardPaymentMethodValues = CreditCardFieldsetValues | CardInstrumentFieldsetValues;

class CreditCardPaymentMethodComponent extends Component<
    CreditCardPaymentMethodProps & PaymentMethodProps
> {
    state: CreditCardPaymentMethodState = {
        isAddingNewCard: false,
    };

    private filterInstruments = memoizeOne(
        (instruments: PaymentInstrument[] = []): CardInstrument[] =>
            instruments.filter(isCardInstrument),
    );

    async componentDidMount(): Promise<void> {
        const {
            initializePayment,
            method,
            onUnhandledError,
            paymentForm: { setValidationSchema },
        } = this.props;
        const { isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp, loadInstruments } =
            this.getCreditCardPaymentMethodDerivedProps();

        setValidationSchema(method, this.getValidationSchema());
        configureCardValidator();

        try {
            if (isInstrumentFeatureAvailableProp) {
                await loadInstruments();
            }

            await initializePayment(
                {
                    gatewayId: method.gateway,
                    methodId: method.id,
                },
                this.getSelectedInstrument(),
            );
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    async componentWillUnmount(): Promise<void> {
        const {
            deinitializePayment,
            method,
            onUnhandledError,
            paymentForm: { setValidationSchema },
        } = this.props;

        setValidationSchema(method, null);

        try {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    }

    async componentDidUpdate(
        _prevProps: Readonly<CreditCardPaymentMethodProps>,
        prevState: Readonly<CreditCardPaymentMethodState>,
    ): Promise<void> {
        const {
            deinitializePayment,
            initializePayment,
            method,
            onUnhandledError,
            paymentForm: { setValidationSchema },
        } = this.props;

        const { isAddingNewCard, selectedInstrumentId } = this.state;

        setValidationSchema(method, this.getValidationSchema());

        if (
            selectedInstrumentId !== prevState.selectedInstrumentId ||
            isAddingNewCard !== prevState.isAddingNewCard
        ) {
            try {
                await deinitializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });

                await initializePayment(
                    {
                        gatewayId: method.gateway,
                        methodId: method.id,
                    },
                    this.getSelectedInstrument(),
                );
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        }
    }

    render(): ReactNode {
        const {
            checkoutState,
            cardFieldset,
            getStoredCardValidationFieldset,
            isInitializing,
            method,
        } = this.props;
        const {
            instruments,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments,
            shouldShowInstrumentFieldset,
        } = this.getCreditCardPaymentMethodDerivedProps();
        const {
            data: { getConfig },
        } = checkoutState;

        const { isAddingNewCard } = this.state;

        const selectedInstrument = this.getSelectedInstrument();
        const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
        const isLoading = isInitializing || isLoadingInstruments;
        const shouldShowNumberField = selectedInstrument
            ? isInstrumentCardNumberRequiredProp(selectedInstrument)
            : false;
        const shouldShowCardCodeField = selectedInstrument
            ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
            : false;

        const storeConfig = getConfig();

        if (!storeConfig) {
            throw Error('Unable to get config or customer');
        }

        return (
            <LocaleContext.Provider value={createLocaleContext(storeConfig)}>
                <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                    <div className="paymentMethod paymentMethod--creditCard">
                        {shouldShowInstrumentFieldset && (
                            <CardInstrumentFieldset
                                instruments={instruments}
                                onDeleteInstrument={this.handleDeleteInstrument}
                                onSelectInstrument={this.handleSelectInstrument}
                                onUseNewInstrument={this.handleUseNewCard}
                                selectedInstrumentId={
                                    selectedInstrument && selectedInstrument.bigpayToken
                                }
                                validateInstrument={
                                    getStoredCardValidationFieldset ? (
                                        getStoredCardValidationFieldset(selectedInstrument)
                                    ) : (
                                        <CreditCardValidation
                                            shouldShowCardCodeField={shouldShowCardCodeField}
                                            shouldShowNumberField={shouldShowNumberField}
                                        />
                                    )
                                }
                            />
                        )}

                        {shouldShowCreditCardFieldset && !cardFieldset && (
                            <CreditCardFieldset
                                shouldShowCardCodeField={
                                    method.config.cardCode || method.config.cardCode === null
                                }
                                shouldShowCustomerCodeField={method.config.requireCustomerCode}
                            />
                        )}

                        {shouldShowCreditCardFieldset && cardFieldset}

                        {isInstrumentFeatureAvailableProp && (
                            <StoreInstrumentFieldset
                                instrumentId={selectedInstrument && selectedInstrument.bigpayToken}
                                instruments={instruments}
                            />
                        )}
                    </div>
                </LoadingOverlay>
            </LocaleContext.Provider>
        );
    }

    private getSelectedInstrument(): CardInstrument | undefined {
        const { instruments } = this.getCreditCardPaymentMethodDerivedProps();
        const { selectedInstrumentId = this.getDefaultInstrumentId() } = this.state;

        return find(instruments, { bigpayToken: selectedInstrumentId });
    }

    private getDefaultInstrumentId(): string | undefined {
        const { isAddingNewCard } = this.state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = this.getCreditCardPaymentMethodDerivedProps();

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    }

    private getValidationSchema(): ObjectSchema | null {
        const { cardValidationSchema, language, method, storedCardValidationSchema } = this.props;
        const {
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isPaymentDataRequired,
        } = this.getCreditCardPaymentMethodDerivedProps();

        if (!isPaymentDataRequired) {
            return null;
        }

        const selectedInstrument = this.getSelectedInstrument();

        if (isInstrumentFeatureAvailableProp && selectedInstrument) {
            return (
                storedCardValidationSchema ||
                getInstrumentValidationSchema({
                    instrumentBrand: selectedInstrument.brand,
                    instrumentLast4: selectedInstrument.last4,
                    isCardCodeRequired: isInstrumentCardCodeRequiredProp(
                        selectedInstrument,
                        method,
                    ),
                    isCardNumberRequired: isInstrumentCardNumberRequiredProp(selectedInstrument),
                    language,
                })
            );
        }

        return (
            cardValidationSchema ||
            getCreditCardValidationSchema({
                isCardCodeRequired: method.config.cardCode === true,
                language,
            })
        );
    }

    private handleUseNewCard: () => void = () => {
        this.setState({
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });
    };

    private handleSelectInstrument: (id: string) => void = (id) => {
        this.setState({
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    private handleDeleteInstrument: (id: string) => void = (id) => {
        const {
            paymentForm: { setFieldValue },
        } = this.props;
        const { instruments } = this.getCreditCardPaymentMethodDerivedProps();
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

    private getCreditCardPaymentMethodDerivedProps(): CreditCardPaymentMethodDerivedProps {
        const { checkoutService, checkoutState, isUsingMultiShipping = false, method } = this.props;

        const {
            data: { getConfig, getCustomer, getInstruments, isPaymentDataRequired },
            statuses: { isLoadingInstruments },
        } = checkoutState;

        const config = getConfig();
        const customer = getCustomer();

        if (!config || !customer || !method) {
            throw new Error('Unable to get checkout');
        }

        const instruments = this.filterInstruments(getInstruments(method));
        const isInstrumentFeatureAvailableProp = isInstrumentFeatureAvailable({
            config,
            customer,
            isUsingMultiShipping,
            paymentMethod: method,
        });

        return {
            instruments,
            isCardCodeRequired: method.config.cardCode || method.config.cardCode === null,
            isCustomerCodeRequired: !!method.config.requireCustomerCode,
            isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredSelector(checkoutState),
            isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredSelector(checkoutState),
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
            isLoadingInstruments: isLoadingInstruments(),
            isPaymentDataRequired: isPaymentDataRequired(),
            loadInstruments: checkoutService.loadInstruments,
            shouldShowInstrumentFieldset:
                isInstrumentFeatureAvailableProp && instruments.length > 0,
        };
    }
}

export default CreditCardPaymentMethodComponent;
