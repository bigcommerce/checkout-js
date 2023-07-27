import {
    AdyenV3CreditCardComponentOptions,
    AdyenV3ValidationState,
    CardInstrument,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useRef, useState } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Modal } from '../../ui/modal';

import AdyenV3CardValidation from './AdyenV3CardValidation';
import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<
    HostedWidgetPaymentMethodProps,
    'containerId' | 'hideContentWhenSignedOut'
>;

export interface AdyenOptions {
    [key: string]: AdyenV3CreditCardComponentOptions;
}

export enum AdyenV3PaymentMethodType {
    scheme = 'scheme',
    bcmc = 'bcmc',
}

interface AdyenPaymentMethodRef {
    shouldShowModal: boolean;
    shouldShowNumberField?: boolean;
    cancelAdditionalAction?(): void;
}

const AdyenV3PaymentMethod: FunctionComponent<AdyenPaymentMethodProps> = ({
    initializePayment,
    method,
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
    const adyenOptions: AdyenOptions = {
        [AdyenV3PaymentMethodType.scheme]: {
            hasHolderName: true,
            holderNameRequired: true,
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

    const initializeAdyenPayment: HostedWidgetPaymentMethodProps['initializePayment'] = (
        options,
        selectedInstrument,
    ) => {
        const selectedInstrumentId = selectedInstrument?.bigpayToken;

        return initializePayment({
            ...options,
            adyenv3: {
                cardVerificationContainerId: selectedInstrumentId && cardVerificationContainerId,
                containerId,
                hasVaultedInstruments: !!selectedInstrumentId,
                ...(adyenOptions[component] ? { options: adyenOptions[component] } : {}),
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
    };

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

    return (
        <>
            <HostedWidgetPaymentMethod
                {...rest}
                containerId={containerId}
                hideContentWhenSignedOut
                initializePayment={initializeAdyenPayment}
                isAccountInstrument={isAccountInstrument()}
                method={method}
                shouldHideInstrumentExpiryDate={shouldHideInstrumentExpiryDate}
                validateInstrument={validateInstrument}
            />

            <Modal
                additionalBodyClassName="modal-body--center"
                closeButtonLabel={<TranslatedString id="common.close_action" />}
                isOpen={showAdditionalActionContent}
                onRequestClose={cancelAdditionalActionModalFlow}
                shouldShowCloseButton={true}
            >
                <div id={additionalActionContainerId} style={{ width: '100%' }} />
            </Modal>
            {!showAdditionalActionContent && (
                <div id={additionalActionContainerId} style={{ display: 'none' }} />
            )}
        </>
    );
};

export default AdyenV3PaymentMethod;
