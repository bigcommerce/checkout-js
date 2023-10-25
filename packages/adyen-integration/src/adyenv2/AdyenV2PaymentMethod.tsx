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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    scheme = 'scheme',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    bcmc = 'bcmc',
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const component = method.id as AdyenV2PaymentMethodType;
    const shouldHideInstrumentExpiryDate = component === AdyenV2PaymentMethodType.bcmc;

    const onBeforeLoad = useCallback((shopperInteraction: boolean) => {
        ref.current.shouldShowModal = shopperInteraction;

        setShowAdditionalActionContent(ref.current.shouldShowModal);
    }, []);

    const onComplete = useCallback(() => {
        setShowAdditionalActionContent(false);
        ref.current.cancelAdditionalAction = undefined;
    }, []);

    const onLoad = useCallback((cancel?) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const selectedInstrumentId = selectedInstrument?.bigpayToken;
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

            return checkoutService.initializePayment({
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
            onBeforeLoad,
            onComplete,
            onLoad,
            checkoutService,
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
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                            <AdyenV2Form
                                {...rest}
                                additionalActionContainerId={additionalActionContainerId}
                                cancelAdditionalActionModalFlow={cancelAdditionalActionModalFlow}
                                checkoutService={checkoutService}
                                checkoutState={checkoutState}
                                containerId={containerId}
                                initializePayment={initializeAdyenPayment}
                                isAccountInstrument={isAccountInstrument()}
                                language={language}
                                method={method}
                                paymentForm={paymentForm}
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
