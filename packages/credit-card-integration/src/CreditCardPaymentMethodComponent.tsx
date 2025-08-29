import { find } from 'lodash';
import React, { type ReactElement, useEffect, useRef, useState } from 'react';
import { type ObjectSchema } from 'yup';

import {
    CardInstrumentFieldset,
    configureCardValidator,
    CreditCardFieldset,
    CreditCardValidation,
    getCreditCardValidationSchema,
    getInstrumentValidationSchema,
    isInstrumentFeatureAvailable as getIsInstrumentFeatureAvailable,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { type CreditCardPaymentMethodProps } from './CreditCardPaymentMethodType';

export const CreditCardPaymentMethodComponent = ({
    cardFieldset,
    cardValidationSchema,
    checkoutService,
    checkoutState,
    deinitializePayment,
    getStoredCardValidationFieldset,
    initializePayment,
    isInitializing,
    isUsingMultiShipping = false,
    language,
    method,
    onUnhandledError,
    paymentForm: { setFieldValue, setValidationSchema },
    storedCardValidationSchema,
}: CreditCardPaymentMethodProps & PaymentMethodProps): ReactElement => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string>();

    const {
        data: { getConfig, getCustomer, getInstruments, isPaymentDataRequired },
        statuses: { isLoadingInstruments },
    } = checkoutState;
    const config = getConfig();
    const customer = getCustomer();

    if (!config || !customer || !method) {
        throw new Error('Unable to get checkout');
    }

    const instruments = getInstruments(method)?.filter(isCardInstrument) ?? [];
    const isInstrumentFeatureAvailable = getIsInstrumentFeatureAvailable({
        config,
        customer,
        isUsingMultiShipping,
        paymentMethod: method,
    });
    const isInstrumentCardCodeRequired = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequired = isInstrumentCardNumberRequiredSelector(checkoutState);
    const loadInstruments = checkoutService.loadInstruments;
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailable && instruments.length > 0;
    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
    const isLoading = isInitializing || isLoadingInstruments();
    const getDefaultInstrumentId = (): string | undefined => {
        if (isAddingNewCard) {
            return;
        }

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    };
    const selectedInstrument = find(instruments, {
        bigpayToken: selectedInstrumentId || getDefaultInstrumentId(),
    });
    const shouldShowNumberField = selectedInstrument
        ? isInstrumentCardNumberRequired(selectedInstrument, method)
        : false;
    const shouldShowCardCodeField = selectedInstrument
        ? isInstrumentCardCodeRequired(selectedInstrument, method)
        : false;

    const getValidationSchema = (): ObjectSchema | null => {
        if (!isPaymentDataRequired()) {
            return null;
        }

        if (isInstrumentFeatureAvailable && selectedInstrument) {
            return (
                storedCardValidationSchema ||
                getInstrumentValidationSchema({
                    instrumentBrand: selectedInstrument.brand,
                    instrumentLast4: selectedInstrument.last4,
                    isCardCodeRequired: isInstrumentCardCodeRequired(selectedInstrument, method),
                    isCardNumberRequired: isInstrumentCardNumberRequired(
                        selectedInstrument,
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

    const handleUseNewCard = (): void => {
        setIsAddingNewCard(true);
        setSelectedInstrumentId(undefined);
    };

    const handleSelectInstrument = (id: string): void => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    };

    const handleDeleteInstrument = (id: string): void => {
        if (instruments.length === 0) {
            setIsAddingNewCard(true);
            setSelectedInstrumentId(undefined);
            setFieldValue('instrumentId', '');
        } else if (selectedInstrumentId === id) {
            const defaultInstrumentId = getDefaultInstrumentId();

            setSelectedInstrumentId(defaultInstrumentId);
            setFieldValue('instrumentId', defaultInstrumentId);
        }
    };

    useEffect(() => {
        const init = async () => {
            setValidationSchema(method, getValidationSchema());
            configureCardValidator();

            try {
                if (isInstrumentFeatureAvailable) {
                    await loadInstruments();
                }

                await initializePayment(
                    {
                        gatewayId: method.gateway,
                        methodId: method.id,
                    },
                    selectedInstrument,
                );
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void init();

        return () => {
            const deInit = async () => {
                try {
                    setValidationSchema(method, null);

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

            void deInit();
        };
    }, []);

    const isInitialRenderRef = useRef(true);

    useEffect(() => {
        if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false;

            return;
        }

        const reInit = async () => {
            try {
                setValidationSchema(method, getValidationSchema());

                await deinitializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });

                await initializePayment(
                    {
                        gatewayId: method.gateway,
                        methodId: method.id,
                    },
                    selectedInstrument,
                );
            } catch (error: unknown) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void reInit();
    }, [selectedInstrumentId, isAddingNewCard]);

    return (
        <LocaleContext.Provider value={createLocaleContext(config)}>
            <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                <div className="paymentMethod paymentMethod--creditCard">
                    {shouldShowInstrumentFieldset && (
                        <CardInstrumentFieldset
                            instruments={instruments}
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
                        <CreditCardFieldset
                            shouldShowCardCodeField={
                                method.config.cardCode || method.config.cardCode === null
                            }
                            shouldShowCustomerCodeField={method.config.requireCustomerCode}
                        />
                    )}

                    {shouldShowCreditCardFieldset && cardFieldset}

                    {isInstrumentFeatureAvailable && (
                        <StoreInstrumentFieldset
                            instrumentId={selectedInstrument && selectedInstrument.bigpayToken}
                            instruments={instruments}
                        />
                    )}
                </div>
            </LoadingOverlay>
        </LocaleContext.Provider>
    );
};
