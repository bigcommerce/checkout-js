import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';

import { Modal } from '../../ui/modal';

import HostedCreditCardPaymentMethod, { HostedCreditCardPaymentMethodProps } from './HostedCreditCardPaymentMethod';

export type WorldpayCreditCardPaymentMethodProps = HostedCreditCardPaymentMethodProps;

interface WorldpayPaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    paymentPageContentMetaDataRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const WorldpayCreditCardPaymentMethod: FunctionComponent<WorldpayCreditCardPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const [threeDSecureVerification, setThreeDSecureVerification] = useState<HTMLElement>();
    const [metadata, setMetadata] = useState<HTMLElement>();

    const ref = useRef<WorldpayPaymentMethodRef>({
        paymentPageContentRef: createRef(),
        paymentPageContentMetaDataRef: createRef(),
    });

    const cancelWorldpayModalFlow = useCallback(() => {
        setThreeDSecureVerification(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);

    const initializeWorldpayPayment = useCallback((options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            worldpay: {
                onLoad(content: HTMLIFrameElement, cancel: () => void) {
                    setThreeDSecureVerification(content);
                    setMetadata(content);
                    ref.current.cancelThreeDSecureVerification = cancel;
                },
            },
        });
    }, [initializePayment]);

    const appendPaymentPageContent = useCallback(() => {
        if (ref.current.paymentPageContentRef.current && threeDSecureVerification) {
            ref.current.paymentPageContentRef.current.appendChild(threeDSecureVerification);
        }
    }, [threeDSecureVerification]);

    if (metadata) {
        ref.current.paymentPageContentMetaDataRef.current?.appendChild(metadata);
    }

    return <>
        <HostedCreditCardPaymentMethod
            { ...rest }
            initializePayment={ initializeWorldpayPayment }
        />
        <Modal
            isOpen={ !!threeDSecureVerification }
            onAfterOpen={ appendPaymentPageContent }
            onRequestClose={ cancelWorldpayModalFlow }
            shouldShowCloseButton={ true }
        >
            <div ref={ ref.current.paymentPageContentRef } />
        </Modal>
        <div hidden ref={ ref.current.paymentPageContentMetaDataRef } />
    </>;
};

export default WorldpayCreditCardPaymentMethod;
