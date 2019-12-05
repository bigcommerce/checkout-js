import { AdyenCreditCardComponentOptions } from '@bigcommerce/checkout-sdk';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';
import { Omit } from 'utility-types';

import { TranslatedString } from '../../locale';
import { Modal } from '../../ui/modal';

import AdyenV2CardValidation from './AdyenV2CardValidation';
import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type AdyenPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId' | 'hideContentWhenSignedOut'>;

export interface AdyenOptions {
    scheme: AdyenCreditCardComponentOptions;
    bcmc: AdyenCreditCardComponentOptions;
}

export enum AdyenMethodType {
    scheme = 'scheme',
    bcmc = 'bcmc',
}

interface AdyenPaymentMethodRef {
    threeDSecureContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const AdyenV2PaymentMethod: FunctionComponent<AdyenPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const ref = useRef<AdyenPaymentMethodRef>({
        threeDSecureContentRef: createRef(),
    });
    const [threeDSecureContent, setThreeDSecureContent] = useState<HTMLElement>();
    const containerId = `${method.id}-adyen-component-field`;
    const threeDS2ContainerId = `${containerId}-3ds`;
    const cardVerificationContainerId = `${method.id}-tsv`;
    const component = method.id as AdyenMethodType;
    const adyenOptions: AdyenOptions = {
        [AdyenMethodType.scheme]: {
            hasHolderName: true,
        },
        [AdyenMethodType.bcmc]: {
            hasHolderName: false,
        },
    };

    const onLoad = useCallback(cancel => {
        const div = document.createElement('div');
        div.setAttribute('id', threeDS2ContainerId);

        setThreeDSecureContent(div);
        ref.current.cancelThreeDSecureVerification = cancel;
    }, [threeDS2ContainerId]);

    const onComplete = useCallback(() => {
        setThreeDSecureContent(undefined);
        ref.current.cancelThreeDSecureVerification = undefined;
    }, []);

    const appendThreeDSecureContent = useCallback(() => {
        if (ref.current.threeDSecureContentRef.current && threeDSecureContent) {
            ref.current.threeDSecureContentRef.current.appendChild(threeDSecureContent);
        }
    }, [threeDSecureContent]);

    const cancelThreeDSecureModalFlow = useCallback(() => {
        setThreeDSecureContent(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);

    const initializeAdyenPayment: HostedWidgetPaymentMethodProps['initializePayment'] = useCallback((options, selectedInstrumentId) => {
        return initializePayment({
            ...options,
            adyenv2: {
                cardVerificationContainerId: selectedInstrumentId && cardVerificationContainerId,
                containerId,
                options: adyenOptions[component],
                threeDS2ContainerId,
                threeDS2Options: {
                    widgetSize: '05',
                    onLoad,
                    onComplete,
                },
            },
        });
    }, [initializePayment, component, cardVerificationContainerId, containerId, threeDS2ContainerId, adyenOptions, onLoad, onComplete]);

    const validateInstrument = (shouldShowNumberField: boolean) => {
        return <AdyenV2CardValidation
            shouldShowNumberField={ shouldShowNumberField }
            verificationFieldsContainerId={ cardVerificationContainerId }
        />;
    };

    return <>
        <HostedWidgetPaymentMethod
            { ...rest }
            containerId={ containerId }
            hideContentWhenSignedOut
            initializePayment={ initializeAdyenPayment }
            method={ method }
            validateInstrument={ validateInstrument }
        />

        <Modal
            additionalBodyClassName="modal-body--center"
            closeButtonLabel={ <TranslatedString id="common.close_action" /> }
            isOpen={ !!threeDSecureContent }
            onAfterOpen={ appendThreeDSecureContent }
            onRequestClose={ cancelThreeDSecureModalFlow }
            shouldShowCloseButton={ true }
        >
            <div
                ref={ ref.current.threeDSecureContentRef }
                style={ { width: '100%' } }
            />
        </Modal>
    </>;
};

export default AdyenV2PaymentMethod;
