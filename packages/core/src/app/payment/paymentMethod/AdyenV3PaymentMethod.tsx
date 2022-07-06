import { AdyenV3CreditCardComponentOptions } from '@bigcommerce/checkout-sdk';
import _ from 'lodash';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';
import { Modal } from '../../ui/modal';

import AdyenV3CardValidation, { AdyenV3CardValidationState } from './AdyenV3CardValidation';
import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

export interface AdyenOptions {
    [key: string]: AdyenV3CreditCardComponentOptions;
}

export enum AdyenV3PaymentMethodType {
    scheme = 'scheme',
    bcmc = 'bcmc',
}

interface AdyenPaymentMethodRef {
    additionalActionContentRef: RefObject<HTMLDivElement>;
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
        additionalActionContentRef: createRef(),
    });

    const [additionalActionContent, setAdditionalActionContent] = useState<HTMLElement>();
    const [cardValidationState, setCardValidationState] = useState<AdyenV3CardValidationState>();
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

    const onBeforeLoad = useCallback((shopperInteraction: boolean)  => {
        ref.current.shouldShowModal = shopperInteraction;

        if (ref.current.shouldShowModal) {
            const div = document.createElement('div');

            div.setAttribute('id', additionalActionContainerId);
            setAdditionalActionContent(div);
        } else {
            setAdditionalActionContent(undefined);
        }
    }, [additionalActionContainerId]);

    const onComplete = useCallback(() => {
        setAdditionalActionContent(undefined);
        ref.current.cancelAdditionalAction = undefined;
    }, []);

    const onLoad = useCallback((cancel?) => {
        ref.current.cancelAdditionalAction = cancel;
    }, []);

    const appendAdditionalActionContent = useCallback(() => {
        if (ref.current.additionalActionContentRef.current && additionalActionContent) {
            ref.current.additionalActionContentRef.current.appendChild(additionalActionContent);
        }
    }, [additionalActionContent]);

    const cancelAdditionalActionModalFlow = useCallback(() => {
        setAdditionalActionContent(undefined);

        if (ref.current.cancelAdditionalAction) {
            ref.current.cancelAdditionalAction();
            ref.current.cancelAdditionalAction = undefined;
        }
    }, []);

    const initializeAdyenPayment: HostedWidgetPaymentMethodProps['initializePayment'] = (options, selectedInstrument) => {
        const selectedInstrumentId = selectedInstrument?.bigpayToken;

        return initializePayment({
            ...options,
            adyenv3: {
                cardVerificationContainerId: selectedInstrumentId && cardVerificationContainerId,
                containerId,
                hasVaultedInstruments: !!selectedInstrumentId,
                ...(adyenOptions[component] ? {options: adyenOptions[component]} : {}),
                additionalActionOptions: {
                    widgetSize: '05',
                    containerId: additionalActionContainerId,
                    onBeforeLoad,
                    onComplete,
                    onLoad,
                },
                shouldShowNumberField: ref.current.shouldShowNumberField,
                validateCardFields: (state: AdyenV3CardValidationState) => { setCardValidationState(state); },
            },
        });
    };

    const validateInstrument = (shouldShowNumberField: boolean) => {

        ref.current.shouldShowNumberField = shouldShowNumberField;

        return <AdyenV3CardValidation
            cardValidationState = { cardValidationState }
            paymentMethodType={ method.method }
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
            isOpen={ !!additionalActionContent && ref.current.shouldShowModal }
            onAfterOpen={ appendAdditionalActionContent }
            onRequestClose={ cancelAdditionalActionModalFlow }
            shouldShowCloseButton={ true }
        >
            <div
                ref={ ref.current.additionalActionContentRef }
                style={ { width: '100%' } }
            />
        </Modal>
        { !additionalActionContent &&
            <div
                id= { additionalActionContainerId }
                style={ { display: 'none' } }
            /> }
    </>;
};

export default AdyenV3PaymentMethod;
