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
import classNames from 'classnames';
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

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import {
    AccountInstrumentFieldset,
    assertIsCardInstrument,
    CardInstrumentFieldset,
    isBankAccountInstrument,
    isCardInstrument,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

export interface PaymentContextProps {
    disableSubmit(method: PaymentMethod, disabled?: boolean): void;
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

    const getDefaultInstrumentId = useCallback((): string | undefined => {
        if (isAddingNewCard) {
            return undefined;
        }

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument ? defaultInstrument.bigpayToken : undefined;
    }, [isAddingNewCard, instruments]);

    const getSelectedInstrument = useCallback((): PaymentInstrument | undefined => {
        const currentSelectedId = selectedInstrumentId || getDefaultInstrumentId();

        return find(instruments, { bigpayToken: currentSelectedId });
    }, [instruments, selectedInstrumentId, getDefaultInstrumentId]);

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

    const getSelectedBankAccountInstrument = (
        addingNew: boolean,
        currentSelectedInstrument: PaymentInstrument,
    ): AccountInstrument | undefined => {
        return !addingNew && isBankAccountInstrument(currentSelectedInstrument)
            ? currentSelectedInstrument
            : undefined;
    };

    const handleDeleteInstrument = (id: string): void => {
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
    };

    const handleUseNewCard = async () => {
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
    };

    const handleSelectInstrument = (id: string) => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    };

    const getValidateInstrument = (): ReactNode | undefined => {
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
    };

    const initializeMethod = async (): Promise<CheckoutSelectors | void> => {
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
                instruments.find(
                    (instrument) => instrument.bigpayToken === currentSelectedInstrumentId,
                ) || instruments[0];

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

    const PaymentDescriptor = (): ReactNode => {
        if (shouldShowDescriptor && paymentDescriptor) {
            return <div className="payment-descriptor">{paymentDescriptor}</div>;
        }

        return null;
    };

    const PaymentWidget = (): ReactElement => (
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
            {shouldRenderCustomInstrument && renderCustomPaymentForm && renderCustomPaymentForm()}
        </div>
    );

    const EditButton = (): ReactNode => {
        if (shouldShowEditButton) {
            const translatedString = <TranslatedString id="remote.select_different_card_action" />;

            return (
                <p>
                    <button
                        className={classNames('stepHeader', 'widget-link-amazonpay')}
                        id={buttonId}
                        onClick={preventDefault()}
                        type="button"
                    >
                        {translatedString}
                    </button>
                </p>
            );
        }

        return null;
    };

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

                <PaymentDescriptor />

                <PaymentWidget />

                {isInstrumentFeatureAvailableProp && (
                    <StoreInstrumentFieldset
                        instrumentId={effectiveSelectedInstrumentId}
                        instruments={instruments}
                        isAccountInstrument={Boolean(
                            isAccountInstrument || shouldShowAccountInstrument,
                        )}
                    />
                )}

                <EditButton />
            </div>
        </LoadingOverlay>
    );
};

export default HostedWidgetPaymentComponent;
