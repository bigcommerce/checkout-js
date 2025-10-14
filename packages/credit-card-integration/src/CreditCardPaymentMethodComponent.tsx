import {
    type CardInstrument,
    type CheckoutSelectors,
    type HostedFieldType,
    type Instrument,
    type LegacyHostedFormOptions,
    type PaymentInitializeOptions,
    type PaymentInstrument,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { find } from 'lodash';
import React, { type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react';
import { type ObjectSchema } from 'yup';

import {
    CardInstrumentFieldset,
    configureCardValidator,
    CreditCardFieldset,
    type CreditCardFieldsetValues,
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
    CaptureMessageComponent,
    type CardInstrumentFieldsetValues,
    type PaymentMethodProps,
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
    getHostedFormOptions?(selectedInstrument?: CardInstrument): Promise<LegacyHostedFormOptions>;
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
    isInstrumentCardNumberRequired(instrument: Instrument, method: PaymentMethod): boolean;
}

interface CreditCardPaymentMethodState {
    focusedHostedFieldType?: HostedFieldType;
    isAddingNewCard: boolean;
    selectedInstrumentId?: string;
}

export type CreditCardPaymentMethodValues = CreditCardFieldsetValues | CardInstrumentFieldsetValues;

export const CreditCardPaymentMethodComponent = (
    props: CreditCardPaymentMethodProps & PaymentMethodProps,
): ReactElement => {
    const [state, setState] = useState<CreditCardPaymentMethodState>({
        isAddingNewCard: false,
    });

    const filterInstruments = memoizeOne(
        (instruments: PaymentInstrument[] = []): CardInstrument[] =>
            instruments.filter(isCardInstrument),
    );

    const getCreditCardPaymentMethodDerivedProps = (): CreditCardPaymentMethodDerivedProps => {
        const { checkoutState, isUsingMultiShipping = false, method } = props;

        const {
            data: { getConfig, getCustomer, getInstruments, isPaymentDataRequired },
            statuses: { isLoadingInstruments: isLoadingInstrumentsProp },
        } = checkoutState;

        const config = getConfig();
        const customer = getCustomer();

        if (!config || !customer || !method) {
            throw new Error('Unable to get checkout');
        }

        const instruments = filterInstruments(getInstruments(method));

        const isInstrumentFeatureAvailableFlag = isInstrumentFeatureAvailable({
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
            isInstrumentFeatureAvailable: isInstrumentFeatureAvailableFlag,
            isLoadingInstruments: isLoadingInstrumentsProp(),
            isPaymentDataRequired: isPaymentDataRequired(),
            shouldShowInstrumentFieldset:
                isInstrumentFeatureAvailableFlag && instruments.length > 0,
        };
    };

    const getDefaultInstrumentId = (): string | undefined => {
        const { isAddingNewCard } = state;

        if (isAddingNewCard) {
            return;
        }

        const { instruments } = getCreditCardPaymentMethodDerivedProps();

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    };

    const getSelectedInstrument = (): CardInstrument | undefined => {
        const { instruments } = getCreditCardPaymentMethodDerivedProps();
        const { selectedInstrumentId = getDefaultInstrumentId() } = state;

        return find(instruments, { bigpayToken: selectedInstrumentId });
    };

    const getValidationSchema = (): ObjectSchema | null => {
        const { cardValidationSchema, language, method, storedCardValidationSchema } = props;
        const {
            isInstrumentCardCodeRequired: innerIsInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequired: innerIsInstrumentCardNumberRequiredProp,
            isInstrumentFeatureAvailable: innerIsInstrumentFeatureAvailableProp,
            isPaymentDataRequired,
        } = getCreditCardPaymentMethodDerivedProps();

        if (!isPaymentDataRequired) {
            return null;
        }

        const innerSelectedInstrument = getSelectedInstrument();

        if (innerIsInstrumentFeatureAvailableProp && innerSelectedInstrument) {
            return (
                storedCardValidationSchema ||
                getInstrumentValidationSchema({
                    instrumentBrand: innerSelectedInstrument.brand,
                    instrumentLast4: innerSelectedInstrument.last4,
                    isCardCodeRequired: innerIsInstrumentCardCodeRequiredProp(
                        innerSelectedInstrument,
                        method,
                    ),
                    isCardNumberRequired: innerIsInstrumentCardNumberRequiredProp(
                        innerSelectedInstrument,
                        method,
                    ),
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
    };

    const handleUseNewCard: () => void = () => {
        setState({
            ...state,
            isAddingNewCard: true,
            selectedInstrumentId: undefined,
        });
    };

    const handleSelectInstrument: (id: string) => void = (id) => {
        setState({
            ...state,
            isAddingNewCard: false,
            selectedInstrumentId: id,
        });
    };

    const handleDeleteInstrument: (id: string) => void = (id) => {
        const {
            paymentForm: { setFieldValue },
        } = props;
        const { instruments } = getCreditCardPaymentMethodDerivedProps();
        const { selectedInstrumentId } = state;

        if (instruments.length === 0) {
            setState({
                ...state,
                isAddingNewCard: true,
                selectedInstrumentId: undefined,
            });

            setFieldValue('instrumentId', '');
        } else if (selectedInstrumentId === id) {
            setState({
                ...state,
                selectedInstrumentId: getDefaultInstrumentId(),
            });

            setFieldValue('instrumentId', getDefaultInstrumentId());
        }
    };

    useEffect(() => {
        const init = async () => {
            const {
                initializePayment,
                method,
                onUnhandledError,
                paymentForm: { setValidationSchema },
            } = props;

            setValidationSchema(method, getValidationSchema());
            configureCardValidator();

            try {
                await initializePayment(
                    {
                        gatewayId: method.gateway,
                        methodId: method.id,
                    },
                    getSelectedInstrument(),
                );
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void init();

        return () => {
            const deinit = async () => {
                const {
                    deinitializePayment,
                    method,
                    onUnhandledError,
                    paymentForm: { setValidationSchema },
                } = props;

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
            };

            void deinit();
        };
    }, []);

    const componentDidMount = useRef(false);

    useEffect(() => {
        if (!componentDidMount.current) {
            componentDidMount.current = true;

            return;
        }

        const reInit = async () => {
            const {
                deinitializePayment,
                initializePayment,
                method,
                onUnhandledError,
                paymentForm: { setValidationSchema },
            } = props;

            setValidationSchema(method, getValidationSchema());

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
                    getSelectedInstrument(),
                );
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void reInit();
    }, [state.selectedInstrumentId, state.isAddingNewCard]);

    const {
        checkoutState: {
            data: { getConfig: getStoreConfig },
        },
        cardFieldset,
        getStoredCardValidationFieldset,
        isInitializing,
        method: methodProp,
    } = props;
    const {
        instruments: outerInstruments,
        isInstrumentCardCodeRequired: isInstrumentCardCodeRequiredProp,
        isInstrumentCardNumberRequired: isInstrumentCardNumberRequiredProp,
        isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
        isLoadingInstruments,
        shouldShowInstrumentFieldset,
    } = getCreditCardPaymentMethodDerivedProps();

    const { isAddingNewCard: isAddingNewCardState } = state;

    const selectedInstrument = getSelectedInstrument();
    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCardState;
    const isLoading = isInitializing || isLoadingInstruments;
    const shouldShowNumberField = selectedInstrument
        ? isInstrumentCardNumberRequiredProp(selectedInstrument, methodProp)
        : false;
    const shouldShowCardCodeField = selectedInstrument
        ? isInstrumentCardCodeRequiredProp(selectedInstrument, methodProp)
        : false;

    const storeConfig = getStoreConfig();

    const SentryMessage = methodProp ? `DataCreditCardFieldset ${JSON.stringify(methodProp)}` : '';

    if (!storeConfig) {
        throw Error('Unable to get config or customer');
    }

    return (
        <LocaleContext.Provider value={createLocaleContext(storeConfig)}>
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <div
                    className="paymentMethod paymentMethod--creditCard"
                    data-test="credit-cart-payment-method"
                >
                    {shouldShowInstrumentFieldset && (
                        <CardInstrumentFieldset
                            instruments={outerInstruments}
                            onDeleteInstrument={handleDeleteInstrument}
                            onSelectInstrument={handleSelectInstrument}
                            onUseNewInstrument={handleUseNewCard}
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
                        <>
                            <CaptureMessageComponent message={SentryMessage} />
                            <CreditCardFieldset
                                shouldShowCardCodeField={
                                    methodProp.config.cardCode ||
                                    methodProp.config.cardCode === null
                                }
                                shouldShowCustomerCodeField={methodProp.config.requireCustomerCode}
                            />
                        </>
                    )}

                    {shouldShowCreditCardFieldset && cardFieldset}

                    {isInstrumentFeatureAvailableProp && (
                        <StoreInstrumentFieldset
                            instrumentId={selectedInstrument && selectedInstrument.bigpayToken}
                            instruments={outerInstruments}
                        />
                    )}
                </div>
            </LoadingOverlay>
        </LocaleContext.Provider>
    );
};
