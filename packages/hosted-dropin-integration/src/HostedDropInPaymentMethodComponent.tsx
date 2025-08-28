import {
    type CardInstrument,
    type CheckoutSelectors,
    type CheckoutService,
    type CustomerInitializeOptions,
    type CustomerRequestOptions,
    type LanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { find, noop, some } from 'lodash';
import React, {
    type ReactElement,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    CardInstrumentFieldset,
    CreditCardValidation,
    isInstrumentFeatureAvailable as getIsInstrumentFeatureAvailable,
    isBankAccountInstrument,
    isCardInstrument,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { type PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

interface HostedDropInPaymentMethodProps {
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

const HostedDropInPaymentMethodComponent = ({
    checkoutService,
    checkoutState,
    containerId,
    hideVerificationFields,
    hideWidget = false,
    isInitializing = false,
    isSignInRequired,
    isUsingMultiShipping = false,
    method,
    paymentForm,
    shouldHideInstrumentExpiryDate = false,
    deinitializeCustomer,
    deinitializePayment,
    initializeCustomer,
    initializePayment,
    onUnhandledError = noop,
    signInCustomer = noop,
    validateInstrument,
}: HostedDropInPaymentMethodProps): ReactElement => {
    const [isAddingNewCard, setIsAddingNewCard] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | undefined>(undefined);

    const {
        data: {
            getCheckout,
            getConfig,
            getCustomer,
            getInstruments,
            isPaymentDataRequired: isPaymentDataRequiredSelector,
        },
        statuses: { isLoadingInstruments: isLoadingInstrumentsSelector },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();

    if (!checkout || !config || !customer) {
        throw new Error('Unable to get checkout');
    }

    const isLoadingInstruments = isLoadingInstrumentsSelector();
    const isPaymentDataRequired = isPaymentDataRequiredSelector();
    const isSignedIn = some(checkout.payments, { providerId: method.id });
    const isInstrumentCardCodeRequired = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequired = isInstrumentCardNumberRequiredSelector(checkoutState);
    const isInstrumentFeatureAvailable = getIsInstrumentFeatureAvailable({
        config,
        customer,
        isUsingMultiShipping,
        paymentMethod: method,
    });
    const loadInstruments = checkoutService.loadInstruments;
    const instruments = useMemo(
        () =>
            getInstruments(method)?.filter(
                (inst) => isCardInstrument(inst) || isBankAccountInstrument(inst),
            ) ?? [],
        [method, getInstruments],
    );
    const defaultInstrumentId = useMemo(() => {
        if (isAddingNewCard) {
            return undefined;
        }

        const firstInstrument = instruments[0] ? instruments[0] : undefined;
        const defaultInstrument =
            instruments.find((instrument) => instrument.defaultInstrument) || firstInstrument;

        return defaultInstrument && defaultInstrument.bigpayToken;
    }, [instruments, isAddingNewCard]);

    const getValidateInstrument = (): ReactNode => {
        const selectedId = selectedInstrumentId ?? defaultInstrumentId;
        const selectedInstrument = find(instruments, { bigpayToken: selectedId });
        const shouldShowNumberField = selectedInstrument
            ? isInstrumentCardNumberRequired(selectedInstrument as CardInstrument)
            : false;
        const shouldShowCardCodeField = selectedInstrument
            ? isInstrumentCardCodeRequired(selectedInstrument as CardInstrument, method)
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
    };

    const initializeMethod = async (): Promise<CheckoutSelectors | void> => {
        const { hidePaymentSubmitButton, setSubmit } = paymentForm;

        const selectedId = selectedInstrumentId ?? defaultInstrumentId;

        if (!isPaymentDataRequired) {
            setSubmit(method, null);
            hidePaymentSubmitButton(method, false);

            return Promise.resolve();
        }

        if (isSignInRequired && !isSignedIn) {
            setSubmit(method, signInCustomer);

            if (initializeCustomer) {
                return initializeCustomer({
                    methodId: method.id,
                });
            }
        }

        setSubmit(method, null);

        return initializePayment(
            {
                gatewayId: method.gateway,
                methodId: method.id,
            },
            selectedId,
        );
    };

    const handleDeleteInstrument = (id: string) => {
        const { setFieldValue } = paymentForm;

        if (instruments.length === 0) {
            setIsAddingNewCard(true);
            setSelectedInstrumentId(undefined);
            setFieldValue('instrumentId', '');
        } else if (selectedInstrumentId === id) {
            const nextDefault = defaultInstrumentId;

            setSelectedInstrumentId(nextDefault);
            setFieldValue('instrumentId', nextDefault);
        }
    };

    const handleSelectInstrument = (id: string) => {
        setIsAddingNewCard(false);
        setSelectedInstrumentId(id);
    };

    const handleUseNewCard = async () => {
        setIsAddingNewCard(true);
        setSelectedInstrumentId(undefined);

        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    };

    const selectedIdForRender = selectedInstrumentId ?? defaultInstrumentId;
    const shouldShowInstrumentFieldset = isInstrumentFeatureAvailable && instruments.length > 0;
    const shouldShowCreditCardFieldset = !shouldShowInstrumentFieldset || isAddingNewCard;
    const isLoading = (isInitializing || isLoadingInstruments) && !hideWidget;

    useEffect(() => {
        const { setSubmit, setValidationSchema } = paymentForm;

        const init = async () => {
            try {
                if (isInstrumentFeatureAvailable) {
                    await loadInstruments();
                }

                await initializeMethod();
            } catch (error) {
                onUnhandledError(error as Error);
            }
        };

        void init();

        return () => {
            setValidationSchema(method, null);
            setSubmit(method, null);

            const deInit = async () => {
                try {
                    await deinitializePayment({
                        gatewayId: method.gateway,
                        methodId: method.id,
                    });

                    if (deinitializeCustomer) {
                        await deinitializeCustomer({ methodId: method.id });
                    }
                } catch (error) {
                    onUnhandledError(error as Error);
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

        const { hidePaymentSubmitButton } = paymentForm;

        hidePaymentSubmitButton(method, !defaultInstrumentId && isPaymentDataRequired);

        const reInit = async () => {
            try {
                await deinitializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                });

                await initializeMethod();
            } catch (error) {
                onUnhandledError(error as Error);
            }
        };

        void reInit();
    }, [instruments, isAddingNewCard, selectedInstrumentId]);

    return (
        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
            {shouldShowInstrumentFieldset && (
                <CardInstrumentFieldset
                    instruments={instruments as CardInstrument[]}
                    onDeleteInstrument={handleDeleteInstrument}
                    onSelectInstrument={handleSelectInstrument}
                    onUseNewInstrument={handleUseNewCard}
                    selectedInstrumentId={selectedIdForRender}
                    shouldHideExpiryDate={shouldHideInstrumentExpiryDate}
                    validateInstrument={getValidateInstrument()}
                />
            )}

            {shouldShowCreditCardFieldset && (
                <div className="paymentMethod--hosted">
                    <div
                        className={classNames('widget', `widget--${method.id}`, 'payment-widget')}
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
};

export default HostedDropInPaymentMethodComponent;
