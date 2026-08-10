import {
    type AccountInstrument,
    type CardInstrument,
    type CheckoutSelectors,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type Instrument,
    type PaymentInitializeOptions,
    type PaymentInstrument,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { find, noop } from 'lodash';
import React, {
    type ReactElement,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { type ObjectSchema } from 'yup';

import {
    AccountInstrumentFieldset,
    assertIsCardInstrument,
    CardInstrumentFieldset,
    isBankAccountInstrument,
    isCardInstrument,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { EditButton } from './EditButton';
import { PaymentDescriptor } from './PaymentDescriptor';
import { PaymentWidget } from './PaymentWidget';

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
    isInstrumentCardNumberRequired(instrument: Instrument, method: PaymentMethod): boolean;
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

const HostedWidgetPaymentComponent = ({
    instruments,
    hideWidget = false,
    isInitializing = false,
    isAccountInstrument,
    isInstrumentFeatureAvailable: isInstrumentFeatureAvailableProp,
    isLoadingInstruments,
    shouldHideInstrumentExpiryDate = false,
    shouldShow = true,
    hideVerificationFields,
    method,
    storedCardValidationSchema,
    isPaymentDataRequired,
    setValidationSchema,
    loadInstruments,
    onUnhandledError = noop,
    deinitializeCustomer,
    deinitializePayment,
    setSubmit,
    initializeCustomer,
    initializePayment,
    signInCustomer,
    isSignedIn,
    isSignInRequired,
    isInstrumentCardNumberRequired,
    validateInstrument,
    containerId,
    hideContentWhenSignedOut = false,
    renderCustomPaymentForm,
    additionalContainerClassName,
    shouldRenderCustomInstrument = false,
    paymentDescriptor,
    shouldShowDescriptor,
    shouldShowEditButton,
    buttonId,
    setFieldValue,
}: HostedWidgetComponentProps & PaymentContextProps): ReactElement => {
    const [isAddingNewCard, setIsAddingNewCard] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>(undefined);
    const instrumentsRef = useRef<PaymentInstrument[]>(instruments);

    useEffect(() => {
        instrumentsRef.current = instruments;
    }, [instruments]);

    const getDefaultInstrumentId = useCallback((): string | undefined => {
        if (isAddingNewCard) {
            return undefined;
        }

        const defaultInstrument =
            instrumentsRef.current.find((instrument) => instrument.defaultInstrument) ||
            instrumentsRef.current[0];

        return defaultInstrument ? defaultInstrument.bigpayToken : undefined;
    }, [isAddingNewCard]);

    const getSelectedInstrument = useCallback((): PaymentInstrument | undefined => {
        const currentSelectedId = selectedInstrumentId || getDefaultInstrumentId();

        return find(instrumentsRef.current, { bigpayToken: currentSelectedId });
    }, [selectedInstrumentId, getDefaultInstrumentId]);

    const getValidationSchema = useCallback((): ObjectSchema | null => {
        if (!isPaymentDataRequired) {
            return null;
        }

        const currentSelectedInstrument = getSelectedInstrument();

        if (isInstrumentFeatureAvailableProp && currentSelectedInstrument) {
            return storedCardValidationSchema || null;
        }

        return null;
    }, [
        getSelectedInstrument,
        isInstrumentFeatureAvailableProp,
        isPaymentDataRequired,
        storedCardValidationSchema,
    ]);

    const getSelectedBankAccountInstrument = useCallback(
        (
            addingNew: boolean,
            currentSelectedInstrument: PaymentInstrument,
        ): AccountInstrument | undefined => {
            return !addingNew && isBankAccountInstrument(currentSelectedInstrument)
                ? currentSelectedInstrument
                : undefined;
        },
        [],
    );

    const handleDeleteInstrument = useCallback(
        (id: string): void => {
            if (instruments.length === 0) {
                setIsAddingNewCard(true);
                setSelectedInstrumentId(undefined);
                setFieldValue('instrumentId', '');

                return;
            }

            if (selectedInstrumentId === id) {
                const nextId = getDefaultInstrumentId();

                setSelectedInstrumentId(nextId);
                setFieldValue('instrumentId', nextId);
            }
        },
        [instruments, selectedInstrumentId, getDefaultInstrumentId],
    );

    const handleUseNewCard = useCallback(async () => {
        setIsAddingNewCard(true);
        setSelectedInstrumentId(undefined);

        if (deinitializePayment) {
            await deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        }

        if (initializePayment) {
            await initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        }
    }, [method, deinitializePayment, initializePayment]);

    const handleSelectInstrument = useCallback((id: string) => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    }, []);

    const getValidateInstrument = useCallback((): ReactNode | undefined => {
        const currentSelectedId = selectedInstrumentId || getDefaultInstrumentId();
        const currentSelectedInstrument = find(instruments, { bigpayToken: currentSelectedId });

        if (currentSelectedInstrument) {
            assertIsCardInstrument(currentSelectedInstrument);

            const shouldShowNumberField = isInstrumentCardNumberRequired(
                currentSelectedInstrument,
                method,
            );

            if (hideVerificationFields) {
                return undefined;
            }

            if (validateInstrument) {
                return validateInstrument(shouldShowNumberField, currentSelectedInstrument);
            }
        }

        return undefined;
    }, [
        selectedInstrumentId,
        getDefaultInstrumentId,
        instruments,
        method,
        hideVerificationFields,
        validateInstrument,
    ]);

    const initializeMethod = async (): Promise<CheckoutSelectors | void> => {
        const currentInstruments = instrumentsRef.current;

        if (!isPaymentDataRequired) {
            setSubmit(method, null);

            return;
        }

        if (isSignInRequired && !isSignedIn) {
            setSubmit(method, signInCustomer || null);

            if (initializeCustomer) {
                return initializeCustomer({ methodId: method.id });
            }

            return;
        }

        setSubmit(method, null);

        let selectedCardInstrument: CardInstrument | undefined;

        if (!isAddingNewCard) {
            const currentSelectedInstrumentId = selectedInstrumentId || getDefaultInstrumentId();
            const maybeInstrument =
                currentInstruments.find(
                    (instrument) => instrument.bigpayToken === currentSelectedInstrumentId,
                ) || currentInstruments[0];

            if (maybeInstrument && isCardInstrument(maybeInstrument)) {
                selectedCardInstrument = maybeInstrument;
            }
        }

        if (initializePayment) {
            return initializePayment(
                { gatewayId: method.gateway, methodId: method.id },
                selectedCardInstrument,
            );
        }
    };

    // Below values are for lower level components
    const effectiveSelectedInstrumentId = selectedInstrumentId || getDefaultInstrumentId();
    const selectedInstrument = effectiveSelectedInstrumentId
        ? instruments.find((i) => i.bigpayToken === effectiveSelectedInstrumentId) || instruments[0]
        : instruments[0];
    const cardInstruments: CardInstrument[] = instruments.filter(
        (i): i is CardInstrument => !isBankAccountInstrument(i),
    );
    const accountInstruments: AccountInstrument[] = instruments.filter(
        (i): i is AccountInstrument => isBankAccountInstrument(i),
    );
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailableProp && instruments.length > 0;
    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
    const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;
    const selectedAccountInstrument = selectedInstrument
        ? getSelectedBankAccountInstrument(isAddingNewCard, selectedInstrument)
        : undefined;
    const shouldShowAccountInstrument = instruments[0] && isBankAccountInstrument(instruments[0]);

    useEffect(() => {
        const init = async () => {
            setValidationSchema(method, getValidationSchema());

            try {
                if (isInstrumentFeatureAvailableProp) {
                    await loadInstruments?.();
                }

                await initializeMethod();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void init();

        return () => {
            const deInit = async () => {
                setValidationSchema(method, null);
                setSubmit(method, null);

                try {
                    if (deinitializePayment) {
                        await deinitializePayment({
                            gatewayId: method.gateway,
                            methodId: method.id,
                        });
                    }

                    if (deinitializeCustomer) {
                        await deinitializeCustomer({ methodId: method.id });
                    }
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
            };

            void deInit();
        };
    }, []);

    const isInitialRenderRef = useRef(true);
    const instrumentsLength = useRef(instruments.length);
    const isPaymentDataRequiredRef = useRef(isPaymentDataRequired);
    const selectedInstrumentIdRef = useRef(selectedInstrumentId);

    useEffect(() => {
        if (isInitialRenderRef.current) {
            isInitialRenderRef.current = false;

            return;
        }

        setValidationSchema(method, getValidationSchema());

        const reInit = async () => {
            try {
                if (deinitializePayment) {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });
                }

                await initializeMethod();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        if (
            selectedInstrumentIdRef.current !== selectedInstrumentId ||
            (Number(instrumentsLength.current) > 0 && instruments.length === 0) ||
            isPaymentDataRequiredRef.current !== isPaymentDataRequired
        ) {
            selectedInstrumentIdRef.current = selectedInstrumentId;
            instrumentsLength.current = instruments.length;
            isPaymentDataRequiredRef.current = isPaymentDataRequired;

            void reInit();
        }
    }, [selectedInstrumentId, instruments, isPaymentDataRequired]);

    if (!shouldShow) {
        return <div style={{ display: 'none' }} />;
    }

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            <div className="paymentMethod--hosted">
                {shouldShowAccountInstrument && shouldShowInstrumentFieldset && (
                    <AccountInstrumentFieldset
                        instruments={accountInstruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewCard}
                        selectedInstrument={selectedAccountInstrument}
                    />
                )}
                {!shouldShowAccountInstrument && shouldShowInstrumentFieldset && (
                    <CardInstrumentFieldset
                        instruments={cardInstruments}
                        onDeleteInstrument={handleDeleteInstrument}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewCard}
                        selectedInstrumentId={effectiveSelectedInstrumentId}
                        shouldHideExpiryDate={shouldHideInstrumentExpiryDate}
                        validateInstrument={getValidateInstrument()}
                    />
                )}

                <PaymentDescriptor
                    paymentDescriptor={paymentDescriptor}
                    shouldShowDescriptor={shouldShowDescriptor}
                />

                <PaymentWidget
                    additionalContainerClassName={additionalContainerClassName}
                    containerId={containerId}
                    hideContentWhenSignedOut={hideContentWhenSignedOut}
                    hideWidget={hideWidget}
                    isSignInRequired={isSignInRequired}
                    isSignedIn={isSignedIn}
                    method={method}
                    renderCustomPaymentForm={renderCustomPaymentForm}
                    shouldRenderCustomInstrument={shouldRenderCustomInstrument}
                    shouldShowCreditCardFieldset={shouldShowCreditCardFieldset}
                />

                {isInstrumentFeatureAvailableProp && (
                    <StoreInstrumentFieldset
                        instrumentId={effectiveSelectedInstrumentId}
                        instruments={instruments}
                        isAccountInstrument={Boolean(
                            isAccountInstrument || shouldShowAccountInstrument,
                        )}
                    />
                )}

                <EditButton buttonId={buttonId} shouldShowEditButton={shouldShowEditButton} />
            </div>
        </LoadingOverlay>
    );
};

export default HostedWidgetPaymentComponent;
