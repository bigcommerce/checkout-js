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

// eslint-disable-next-line complexity
const HostedWidgetPaymentComponent = ({
    instruments,
    hideWidget = false,
    isInitializing = false,
    isAccountInstrument,
    isInstrumentFeatureAvailable,
    isLoadingInstruments,
    shouldHideInstrumentExpiryDate = false,
    shouldShow = true,
    hideVerificationFields,
    method,
    isPaymentDataRequired,
    storedCardValidationSchema,
    isSignedIn,
    isSignInRequired,
    initializeCustomer,
    initializePayment,
    setSubmit,
    signInCustomer = noop,
    setValidationSchema,
    loadInstruments,
    deinitializePayment,
    deinitializeCustomer,
    setFieldValue,
    isInstrumentCardNumberRequired,
    additionalContainerClassName,
    containerId,
    hideContentWhenSignedOut = false,
    shouldRenderCustomInstrument = false,
    renderCustomPaymentForm,
    shouldShowDescriptor,
    paymentDescriptor,
    shouldShowEditButton,
    buttonId,
    onUnhandledError = noop,
    validateInstrument,
}: HostedWidgetComponentProps & PaymentContextProps): ReactElement => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<boolean>(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>(undefined);

    const getDefaultInstrumentId = (): string | undefined => {
        if (isAddingNewCard) {
            return undefined;
        }

        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];

        return defaultInstrument && defaultInstrument.bigpayToken;
    };

    const getSelectedInstrument = (): PaymentInstrument | undefined => {
        const effectiveId = selectedInstrumentId ?? getDefaultInstrumentId();

        return find(instruments, { bigpayToken: effectiveId });
    };

    const getValidationSchema = (): ObjectSchema | null => {
        if (!isPaymentDataRequired) {
            return null;
        }

        const selectedForSchema = getSelectedInstrument();

        if (isInstrumentFeatureAvailable && selectedForSchema) {
            return storedCardValidationSchema || null;
        }

        return null;
    };

    const handleDeleteInstrument = useCallback(
        (id: string) => {
            if (instruments.length === 0) {
                setIsAddingNewCard(true);
                setSelectedInstrumentId(undefined);
                setFieldValue('instrumentId', '');
            } else if (selectedInstrumentId === id) {
                const nextDefault =
                    instruments.find((instrument) => instrument.defaultInstrument) ||
                    instruments[0];
                const nextDefaultId = nextDefault ? nextDefault.bigpayToken : undefined;

                setSelectedInstrumentId(nextDefaultId);
                setFieldValue('instrumentId', nextDefaultId ?? '');
            }
        },
        [instruments, selectedInstrumentId, setFieldValue],
    );

    const getSelectedBankAccountInstrument = (
        isAdding: boolean,
        selectedInstrumentLocal: PaymentInstrument,
    ): AccountInstrument | undefined => {
        return !isAdding && isBankAccountInstrument(selectedInstrumentLocal)
            ? selectedInstrumentLocal
            : undefined;
    };

    const initializeCustomerOrDoNothing = useCallback(
        (options: CustomerInitializeOptions) =>
            Promise.resolve(initializeCustomer ? initializeCustomer(options) : undefined),
        [initializeCustomer],
    );

    const initializePaymentOrDoNothing = useCallback(
        (options: PaymentInitializeOptions, selectedCardInstrument?: CardInstrument) =>
            Promise.resolve(
                initializePayment ? initializePayment(options, selectedCardInstrument) : undefined,
            ),
        [initializePayment],
    );

    const handleUseNewCard = useCallback(async () => {
        setIsAddingNewCard(true);
        setSelectedInstrumentId(undefined);

        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });

        await initializePaymentOrDoNothing({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, initializePaymentOrDoNothing, method.gateway, method.id]);

    const handleSelectInstrument = useCallback((id: string) => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    }, []);

    const getValidateInstrument = (): ReactNode => {
        const effectiveId = selectedInstrumentId ?? getDefaultInstrumentId();
        const selectedInstrumentLocal = find(instruments, {
            bigpayToken: effectiveId,
        });

        if (selectedInstrumentLocal) {
            assertIsCardInstrument(selectedInstrumentLocal);

            const shouldShowNumberField = isInstrumentCardNumberRequired(
                selectedInstrumentLocal,
                method,
            );

            if (hideVerificationFields) {
                return null;
            }

            if (validateInstrument) {
                return validateInstrument(shouldShowNumberField, selectedInstrumentLocal);
            }
        }

        return null;
    };

    const initializeMethod = async () => {
        if (!isPaymentDataRequired) {
            setSubmit(method, null);

            return;
        }

        if ((isSignInRequired ?? false) && !isSignedIn) {
            setSubmit(method, signInCustomer);
            await initializeCustomerOrDoNothing({ methodId: method.id });

            return;
        }

        setSubmit(method, null);

        let selectedInstrumentLocal: CardInstrument | undefined;

        if (!isAddingNewCard) {
            const defaultInstrument =
                instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];
            const defaultId = defaultInstrument && defaultInstrument.bigpayToken;
            const effectiveId = selectedInstrumentId ?? defaultId;
            const candidate =
                instruments.find((instrument) => instrument.bigpayToken === effectiveId) ||
                instruments[0];

            if (candidate && !isBankAccountInstrument(candidate)) {
                assertIsCardInstrument(candidate);
                selectedInstrumentLocal = candidate;
            }
        }

        await initializePaymentOrDoNothing(
            { gatewayId: method.gateway, methodId: method.id },
            selectedInstrumentLocal,
        );
    };

    const effectiveSelectedInstrumentId = selectedInstrumentId ?? getDefaultInstrumentId();
    const selectedInstrument =
        instruments.find(
            (instrument) => instrument.bigpayToken === effectiveSelectedInstrumentId,
        ) || instruments[0];
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailable && instruments.length > 0;
    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
    const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;
    const selectedAccountInstrument = getSelectedBankAccountInstrument(
        isAddingNewCard,
        selectedInstrument,
    );
    const shouldShowAccountInstrument = instruments[0] && isBankAccountInstrument(instruments[0]);
    const accountInstruments = instruments.filter(isBankAccountInstrument);
    const cardInstruments = instruments.filter(isCardInstrument);

    useEffect(() => {
        setValidationSchema(method, getValidationSchema());

        const init = async () => {
            try {
                if (isInstrumentFeatureAvailable) {
                    await loadInstruments();
                }

                await initializeMethod();
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                } else {
                    onUnhandledError(new Error(String(error)));
                }
            }
        };

        void init();

        return () => {
            setValidationSchema(method, null);
            setSubmit(method, null);

            const deInit = async () => {
                try {
                    await deinitializePayment({ gatewayId: method.gateway, methodId: method.id });

                    if (deinitializeCustomer) {
                        await deinitializeCustomer({ methodId: method.id });
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    } else {
                        onUnhandledError(new Error(String(error)));
                    }
                }
            };

            void deInit();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const prevRef = useRef<{
        selectedInstrumentId?: string;
        instrumentsLength: number;
        isPaymentDataRequired: boolean;
    }>();

    useEffect(() => {
        const schema = (() => {
            if (!isPaymentDataRequired) {
                return null;
            }

            const defaultInstrument =
                instruments.find((instrument) => instrument.defaultInstrument) || instruments[0];
            const defaultId = defaultInstrument && defaultInstrument.bigpayToken;
            const effectiveId = selectedInstrumentId ?? defaultId;
            const selected = find(instruments, { bigpayToken: effectiveId });

            if (isInstrumentFeatureAvailable && selected) {
                return storedCardValidationSchema || null;
            }

            return null;
        })();

        setValidationSchema(method, schema);

        const prev = prevRef.current;

        if (
            prev &&
            (selectedInstrumentId !== prev.selectedInstrumentId ||
                (prev.instrumentsLength > 0 && instruments.length === 0) ||
                prev.isPaymentDataRequired !== isPaymentDataRequired)
        ) {
            void (async () => {
                try {
                    await deinitializePayment({ gatewayId: method.gateway, methodId: method.id });

                    if (!isPaymentDataRequired) {
                        setSubmit(method, null);

                        return;
                    }

                    if ((isSignInRequired ?? false) && !isSignedIn) {
                        setSubmit(method, signInCustomer);
                        await initializeCustomerOrDoNothing({ methodId: method.id });

                        return;
                    }

                    setSubmit(method, null);

                    let selectedInstrumentLocal: CardInstrument | undefined;

                    if (!isAddingNewCard) {
                        const defaultInstrument =
                            instruments.find((instrument) => instrument.defaultInstrument) ||
                            instruments[0];
                        const defaultId = defaultInstrument && defaultInstrument.bigpayToken;
                        const effectiveId = selectedInstrumentId ?? defaultId;
                        const candidate =
                            instruments.find(
                                (instrument) => instrument.bigpayToken === effectiveId,
                            ) || instruments[0];

                        if (candidate && !isBankAccountInstrument(candidate)) {
                            assertIsCardInstrument(candidate);
                            selectedInstrumentLocal = candidate;
                        }
                    }

                    await initializePaymentOrDoNothing(
                        { gatewayId: method.gateway, methodId: method.id },
                        selectedInstrumentLocal,
                    );
                } catch (error) {
                    if (error instanceof Error) {
                        onUnhandledError(error);
                    } else {
                        onUnhandledError(new Error(String(error)));
                    }
                }
            })();
        }

        prevRef.current = {
            selectedInstrumentId,
            instrumentsLength: instruments.length,
            isPaymentDataRequired,
        };
    }, [
        selectedInstrumentId,
        instruments,
        isPaymentDataRequired,
        deinitializePayment,
        initializeCustomerOrDoNothing,
        initializePaymentOrDoNothing,
        isSignInRequired,
        isSignedIn,
        method,
        onUnhandledError,
        setSubmit,
        setValidationSchema,
        signInCustomer,
        isInstrumentFeatureAvailable,
        storedCardValidationSchema,
        isAddingNewCard,
    ]);

    if (!shouldShow) {
        return <div />;
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

                {Boolean(shouldShowDescriptor && paymentDescriptor) && (
                    <div className="payment-descriptor">{paymentDescriptor}</div>
                )}

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
                            (hideContentWhenSignedOut &&
                                (isSignInRequired ?? false) &&
                                !isSignedIn) ||
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

                {isInstrumentFeatureAvailable && (
                    <StoreInstrumentFieldset
                        instrumentId={effectiveSelectedInstrumentId}
                        instruments={instruments}
                        isAccountInstrument={isAccountInstrument || shouldShowAccountInstrument}
                    />
                )}

                {shouldShowEditButton && (
                    <p>
                        <button
                            className={classNames('stepHeader', 'widget-link-amazonpay')}
                            id={buttonId}
                            onClick={preventDefault()}
                            type="button"
                        >
                            <TranslatedString id="remote.select_different_card_action" />
                        </button>
                    </p>
                )}
            </div>
        </LoadingOverlay>
    );
};

export default HostedWidgetPaymentComponent;
