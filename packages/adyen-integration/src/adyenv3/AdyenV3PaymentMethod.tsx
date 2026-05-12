import {
    type AdyenCreditCardComponentOptions,
    type AdyenValidationState,
    type CardInstrument,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { createAdyenV3PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/adyen';
import React, { type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import { type HostedWidgetComponentProps } from '@bigcommerce/checkout/hosted-widget-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay, Modal } from '@bigcommerce/checkout/ui';

import AdyenV3CardValidation from './AdyenV3CardValidation';
import AdyenV3Form from './AdyenV3Form';
import './AdyenV3Oney.scss';

export interface AdyenOptions {
    [key: string]: AdyenCreditCardComponentOptions;
}

export enum AdyenV3PaymentMethodType {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scheme = 'scheme',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    bcmc = 'bcmc',
}

interface AdyenPaymentMethodRef {
    shouldShowModal: boolean;
    shouldShowNumberField?: boolean;
    cancelAdditionalAction?(): void;
}

const AdyenV3PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    paymentForm,
    method,
    language,
    onUnhandledError,
    ...rest
}) => {
    const ref = useRef<AdyenPaymentMethodRef>({
        shouldShowModal: true,
    });

    const groupedMethods = // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (method.initializationData as { groupedMethods?: PaymentMethod[] } | null)?.groupedMethods;
    const isGrouped = Boolean(groupedMethods?.length);
    const [selectedVariantMethod, setSelectedVariantMethod] = useState<PaymentMethod>(method);

    const [shouldRenderAdditionalActionContentModal, setShouldRenderAdditionalActionContentModal] =
        useState<boolean>(false);
    const [isAdditionalActionContentModalVisible, setIsAdditionalActionContentModalVisible] =
        useState<boolean>(false);
    const [cardValidationState, setCardValidationState] = useState<AdyenValidationState>();
    const setFieldValueRef = useRef(paymentForm.setFieldValue);
    const containerId = `adyen-${selectedVariantMethod.id}-component-field`;
    const additionalActionContainerId = `adyen-${selectedVariantMethod.id}-additional-action-component-field`;
    const cardVerificationContainerId = `adyen-${selectedVariantMethod.id}-tsv-component-field`;
    const component = selectedVariantMethod.id;
    const shouldHideInstrumentExpiryDate = component === AdyenV3PaymentMethodType.bcmc;

    const handleVariantChange = useCallback(
        (variantId: string) => {
            const variant = groupedMethods?.find((m) => m.id === variantId);

            if (variant && variant.id !== selectedVariantMethod.id) {
                setSelectedVariantMethod(variant);

                paymentForm.setFieldValue('methodIdOverride', variant.id);
            }
        },
        [groupedMethods, paymentForm, selectedVariantMethod.id],
    );

    useEffect(() => {
        setFieldValueRef.current = paymentForm.setFieldValue;
    }, [paymentForm]);

    useEffect(() => {
        if (!isGrouped) {
            return;
        }

        return () => {
            setFieldValueRef.current('methodIdOverride', undefined);
        };
    }, [isGrouped]);

    const onBeforeLoad = useCallback((shopperInteraction: boolean) => {
        ref.current.shouldShowModal = shopperInteraction;

        setShouldRenderAdditionalActionContentModal(ref.current.shouldShowModal);
    }, []);

    const onComplete = useCallback(() => {
        setIsAdditionalActionContentModalVisible(false);
        setShouldRenderAdditionalActionContentModal(false);
        ref.current.cancelAdditionalAction = undefined;
    }, []);

    const onActionHandled = useCallback(() => {
        setIsAdditionalActionContentModalVisible(true);
    }, []);

    const onLoad = useCallback((cancel?: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ref.current.cancelAdditionalAction = cancel;
    }, []);

    const cancelAdditionalActionModalFlow = useCallback(() => {
        setIsAdditionalActionContentModalVisible(false);
        setShouldRenderAdditionalActionContentModal(false);

        if (ref.current.cancelAdditionalAction) {
            ref.current.cancelAdditionalAction();
            ref.current.cancelAdditionalAction = undefined;
        }
    }, []);

    const initializeAdyenPayment: HostedWidgetComponentProps['initializePayment'] = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument?: CardInstrument) => {
            const adyenOptions: AdyenOptions = {
                [AdyenV3PaymentMethodType.scheme]: {
                    hasHolderName: true,
                    holderNameRequired: true,
                },
            };
            const selectedInstrumentId = selectedInstrument?.bigpayToken;

            return checkoutService.initializePayment({
                ...options,
                methodId: component,
                integrations: [createAdyenV3PaymentStrategy],
                adyenv3: {
                    cardVerificationContainerId:
                        selectedInstrumentId && cardVerificationContainerId,
                    containerId,
                    hasVaultedInstruments: !!selectedInstrumentId,
                    options: adyenOptions[component],
                    additionalActionOptions: {
                        widgetSize: '05',
                        containerId: additionalActionContainerId,
                        onBeforeLoad,
                        onComplete,
                        onLoad,
                        onActionHandled,
                    },
                    shouldShowNumberField: ref.current.shouldShowNumberField,
                    validateCardFields: (state: AdyenValidationState) => {
                        setCardValidationState(state);
                    },
                },
            });
        },
        [
            component,
            cardVerificationContainerId,
            containerId,
            additionalActionContainerId,
            onBeforeLoad,
            onComplete,
            onLoad,
            onActionHandled,
            checkoutService,
        ],
    );

    useEffect(() => {
        if (!isGrouped) {
            return;
        }

        paymentForm.setValidationSchema(method, null);
        paymentForm.setSubmit(method, null);

        void initializeAdyenPayment({
            methodId: component,
            gatewayId: method.gateway,
        }).catch((error: unknown) => {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        });

        return () => {
            paymentForm.setValidationSchema(method, null);
            paymentForm.setSubmit(method, null);

            void checkoutService.deinitializePayment({
                gatewayId: method.gateway,
                methodId: component,
            });
        };
        // Re-run only when `initializeAdyenPayment` changes (it already lists `component`, container ids, and `checkoutService`).
        // Adding `method`, `paymentForm`, or `checkoutService` causes an infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initializeAdyenPayment]);

    const validateInstrument = (
        shouldShowNumberField: boolean,
        selectedInstrument: CardInstrument,
    ) => {
        ref.current.shouldShowNumberField = shouldShowNumberField;

        return (
            <AdyenV3CardValidation
                cardValidationState={cardValidationState}
                paymentMethod={method}
                selectedInstrument={selectedInstrument}
                shouldShowNumberField={shouldShowNumberField}
                verificationFieldsContainerId={cardVerificationContainerId}
            />
        );
    };

    const isAccountInstrument = () => {
        switch (method.method) {
            case 'directEbanking':
            case 'giropay':
            case 'ideal':
            case 'sepadirectdebit':
                return true;

            default:
                return false;
        }
    };

    const isLoading =
        checkoutState.statuses.isLoadingInstruments() ||
        checkoutState.statuses.isLoadingPaymentMethod(method.id);

    const formContextProps = {
        isSubmitted: paymentForm.isSubmitted(),
        setSubmitted: paymentForm.setSubmitted,
    };

    return (
        <FormContext.Provider value={formContextProps}>
            {isGrouped ? (
                <>
                    <select
                        className="form-select optimizedCheckout-form-select"
                        onChange={(e) => handleVariantChange(e.target.value)}
                        value={selectedVariantMethod.id}
                    >
                        {groupedMethods!.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.config.displayName}
                            </option>
                        ))}
                    </select>
                    <div id={containerId} />
                    <Modal
                        additionalBodyClassName="modal-body--center"
                        closeButtonLabel={language.translate('common.close_action')}
                        isOpen={shouldRenderAdditionalActionContentModal}
                        onRequestClose={cancelAdditionalActionModalFlow}
                        shouldShowCloseButton={true}
                    >
                        <div id={additionalActionContainerId} style={{ width: '100%' }} />
                    </Modal>
                    {!shouldRenderAdditionalActionContentModal && (
                        <div id={additionalActionContainerId} />
                    )}
                </>
            ) : (
                <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                    <AdyenV3Form
                        {...rest}
                        additionalActionContainerId={additionalActionContainerId}
                        cancelAdditionalActionModalFlow={cancelAdditionalActionModalFlow}
                        checkoutService={checkoutService}
                        checkoutState={checkoutState}
                        containerId={containerId}
                        hideContentWhenSignedOut
                        initializePayment={initializeAdyenPayment}
                        isAccountInstrument={isAccountInstrument()}
                        isModalVisible={isAdditionalActionContentModalVisible}
                        language={language}
                        method={method}
                        onUnhandledError={onUnhandledError}
                        paymentForm={paymentForm}
                        shouldHideInstrumentExpiryDate={shouldHideInstrumentExpiryDate}
                        shouldRenderAdditionalActionContentModal={
                            shouldRenderAdditionalActionContentModal
                        }
                        validateInstrument={validateInstrument}
                    />
                </LoadingOverlay>
            )}
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AdyenV3PaymentMethod,
    [{ gateway: 'adyenv3' }],
);
