import {
    AdyenCreditCardComponentOptions,
    AdyenIdealComponentOptions,
    AdyenV2ValidationState,
    CardInstrument,
    PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';

import { HostedWidgetComponentProps } from '@bigcommerce/checkout/hosted-widget-integration';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay } from '@bigcommerce/checkout/ui';

import AdyenV2CardValidation from './AdyenV2CardValidation';
import AdyenV2Form from './AdyenV2Form';

export interface AdyenOptions {
    scheme: AdyenCreditCardComponentOptions;
    bcmc: AdyenCreditCardComponentOptions;
    ideal: AdyenIdealComponentOptions;
}

export enum AdyenV2PaymentMethodType {
    scheme = 'scheme',
    bcmc = 'bcmc',
    ideal = 'ideal',
}

interface AdyenPaymentMethodRef {
    shouldShowModal: boolean;
    shouldShowNumberField?: boolean;
    cancelAdditionalAction?(): void;
}

const AdyenV2PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
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
    const [showAdditionalActionContent, setShowAdditionalActionContent] = useState<boolean>(false);
    const [cardValidationState, setCardValidationState] = useState<AdyenV2ValidationState>();
    const containerId = `adyen-${method.id}-component-field`;
    const additionalActionContainerId = `adyen-${method.id}-additional-action-component-field`;
    const cardVerificationContainerId = `adyen-${method.id}-tsv-component-field`;
    const threeDS2ContainerId = `adyen-${method.id}-additional-action-component-field`;
    const component = method.id as AdyenV2PaymentMethodType;
    const shouldHideInstrumentExpiryDate = component === AdyenV2PaymentMethodType.bcmc;
    const adyenOptions: AdyenOptions = {
        [AdyenV2PaymentMethodType.scheme]: {
            hasHolderName: true,
            holderNameRequired: true,
        },
        [AdyenV2PaymentMethodType.bcmc]: {
            hasHolderName: false,
        },
        [AdyenV2PaymentMethodType.ideal]: {
            showImage: true,
        },
    };

    const onBeforeLoad = useCallback((shopperInteraction: boolean) => {
        ref.current.shouldShowModal = shopperInteraction;

        if (ref.current.shouldShowModal) {
            setShowAdditionalActionContent(true);
        } else {
            setShowAdditionalActionContent(false);
        }
    }, []);

    const onComplete = useCallback(() => {
        setShowAdditionalActionContent(false);
        ref.current.cancelAdditionalAction = undefined;
    }, []);

    const onLoad = useCallback((cancel?) => {
        ref.current.cancelAdditionalAction = cancel;
    }, []);

    const cancelAdditionalActionModalFlow = useCallback(() => {
        setShowAdditionalActionContent(false);

        if (ref.current.cancelAdditionalAction) {
            ref.current.cancelAdditionalAction();
            ref.current.cancelAdditionalAction = undefined;
        }
    }, []);

    const initializeAdyenPayment: HostedWidgetComponentProps['initializePayment'] = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument: CardInstrument) => {
            const selectedInstrumentId = selectedInstrument?.bigpayToken;

            return await checkoutService.initializePayment({
                ...options,
                adyenv2: {
                    cardVerificationContainerId:
                        selectedInstrumentId && cardVerificationContainerId,
                    containerId,
                    hasVaultedInstruments: !!selectedInstrumentId,
                    options: adyenOptions[component],
                    threeDS2ContainerId,
                    additionalActionOptions: {
                        widgetSize: '05',
                        containerId: additionalActionContainerId,
                        onBeforeLoad,
                        onComplete,
                        onLoad,
                    },
                    shouldShowNumberField: ref.current.shouldShowNumberField,
                    validateCardFields: (state: AdyenV2ValidationState) => {
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
            threeDS2ContainerId,
            adyenOptions,
            onBeforeLoad,
            onComplete,
            onLoad,
            checkoutService,
            checkoutState,
        ],
    );
    const validateInstrument = (
        shouldShowNumberField: boolean,
        selectedInstrument: CardInstrument,
    ) => {
        ref.current.shouldShowNumberField = shouldShowNumberField;

        return (
            <AdyenV2CardValidation
                cardValidationState={cardValidationState}
                language={language}
                paymentMethod={method}
                selectedInstrument={selectedInstrument}
                shouldShowNumberField={shouldShowNumberField}
                verificationFieldsContainerId={cardVerificationContainerId}
            />
        );
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
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                            <AdyenV2Form
                                {...rest}
                                additionalActionContainerId={additionalActionContainerId}
                                cancelAdditionalActionModalFlow={cancelAdditionalActionModalFlow}
                                containerId={containerId}
                                initializePayment={initializeAdyenPayment}
                                language={language}
                                method={method}
                                shouldHideInstrumentExpiryDate={shouldHideInstrumentExpiryDate}
                                showAdditionalActionContent={showAdditionalActionContent}
                                validateInstrument={validateInstrument}
                            />
                        </LoadingOverlay>
                    </PaymentFormContext.Provider>
                </LocaleProvider>
            </CheckoutContext.Provider>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    AdyenV2PaymentMethod,
    [{ gateway: 'adyenv2' }],
);
