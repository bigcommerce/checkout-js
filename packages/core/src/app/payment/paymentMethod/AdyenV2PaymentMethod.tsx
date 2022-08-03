import { AdyenCreditCardComponentOptions, AdyenIdealComponentOptions, AdyenV2ValidationState, CardInstrument } from '@bigcommerce/checkout-sdk';
import _ from 'lodash';
import React, { useCallback, useRef, useState, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';
import { Modal } from '../../ui/modal';

import AdyenV2CardValidation from './AdyenV2CardValidation';
import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

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

const AdyenV2PaymentMethod: FunctionComponent<AdyenPaymentMethodProps> = ({
    initializePayment,
    method,
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

    const onBeforeLoad = useCallback((shopperInteraction: boolean)  => {
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

    const initializeAdyenPayment: HostedWidgetPaymentMethodProps['initializePayment'] = useCallback((options, selectedInstrument) => {
        const selectedInstrumentId = selectedInstrument?.bigpayToken;

        return initializePayment({
            ...options,
            adyenv2: {
                cardVerificationContainerId: selectedInstrumentId && cardVerificationContainerId,
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
                validateCardFields: (state: AdyenV2ValidationState) => { setCardValidationState(state); },
            },
        });
    }, [initializePayment, component, cardVerificationContainerId, containerId, additionalActionContainerId, threeDS2ContainerId, adyenOptions, onBeforeLoad, onComplete, onLoad]);

    const validateInstrument = (shouldShowNumberField: boolean, selectedInstrument: CardInstrument) => {
        ref.current.shouldShowNumberField = shouldShowNumberField;

        return <AdyenV2CardValidation
            cardValidationState = { cardValidationState }
            paymentMethod={ method }
            selectedInstrument={ selectedInstrument }
            shouldShowNumberField={ shouldShowNumberField }
            verificationFieldsContainerId={ cardVerificationContainerId }
        />;
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

    return <>
        <HostedWidgetPaymentMethod
            { ...rest }
            containerId={ containerId }
            hideContentWhenSignedOut
            initializePayment={ initializeAdyenPayment }
            isAccountInstrument={ isAccountInstrument() }
            method={ method }
            shouldHideInstrumentExpiryDate={ shouldHideInstrumentExpiryDate }
            validateInstrument={ validateInstrument }
        />

        <Modal
            additionalBodyClassName="modal-body--center"
            closeButtonLabel={ <TranslatedString id="common.close_action" /> }
            isOpen={ showAdditionalActionContent }
            onRequestClose={ cancelAdditionalActionModalFlow }
            shouldShowCloseButton={ true }
        >
            <div id={ additionalActionContainerId } style={ { width: '100%' } } />
        </Modal>
        { !showAdditionalActionContent &&
            <div
                id= { additionalActionContainerId }
                style={ { display: 'none' } }
            /> }
    </>;
};

export default AdyenV2PaymentMethod;
