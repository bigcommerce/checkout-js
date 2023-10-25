import {
    AdyenV3CreditCardComponentOptions,
    AdyenV3ValidationState,
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

import AdyenV3CardValidation from './AdyenV3CardValidation';
import AdyenV3Form from './AdyenV3Form';

export interface AdyenOptions {
    [key: string]: AdyenV3CreditCardComponentOptions;
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

    const [showAdditionalActionContent, setShowAdditionalActionContent] = useState<boolean>(false);
    const [cardValidationState, setCardValidationState] = useState<AdyenV3ValidationState>();
    const containerId = `adyen-${method.id}-component-field`;
    const additionalActionContainerId = `adyen-${method.id}-additional-action-component-field`;
    const cardVerificationContainerId = `adyen-${method.id}-tsv-component-field`;
    const component = method.id;
    const shouldHideInstrumentExpiryDate = component === AdyenV3PaymentMethodType.bcmc;

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
            const adyenOptions: AdyenOptions = {
                [AdyenV3PaymentMethodType.scheme]: {
                    hasHolderName: true,
                    holderNameRequired: true,
                },
            };
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const selectedInstrumentId = selectedInstrument?.bigpayToken;

            return checkoutService.initializePayment({
                ...options,
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
                    },
                    shouldShowNumberField: ref.current.shouldShowNumberField,
                    validateCardFields: (state: AdyenV3ValidationState) => {
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
            checkoutService,
        ],
    );

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
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
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
                                language={language}
                                method={method}
                                onUnhandledError={onUnhandledError}
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
    AdyenV3PaymentMethod,
    [{ gateway: 'adyenv3' }],
);
