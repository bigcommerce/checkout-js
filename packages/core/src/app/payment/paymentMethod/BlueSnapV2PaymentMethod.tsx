import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';

import { Modal } from '../../ui/modal';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

export type BlueSnapV2PaymentMethodProps = HostedPaymentMethodProps;

interface BlueSnapV2PaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelBlueSnapV2Payment?(): void;
}

const BlueSnapV2PaymentMethod: FunctionComponent<BlueSnapV2PaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const [paymentPageContent, setPaymentPageContent] = useState<HTMLElement>();
    const ref = useRef<BlueSnapV2PaymentMethodRef>({
        paymentPageContentRef: createRef(),
    });

    const cancelBlueSnapV2ModalFlow = useCallback(() => {
        setPaymentPageContent(undefined);

        if (ref.current.cancelBlueSnapV2Payment) {
            ref.current.cancelBlueSnapV2Payment();
            ref.current.cancelBlueSnapV2Payment = undefined;
        }
    }, []);

    const initializeBlueSnapV2Payment = useCallback((options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            bluesnapv2: {
                onLoad(content: HTMLIFrameElement, cancel: () => void) {
                    setPaymentPageContent(content);
                    ref.current.cancelBlueSnapV2Payment = cancel;
                },
                style: {
                    border: '1px solid lightgray',
                    height: '60vh',
                    width: '100%',
                },
            },
        });
    }, [initializePayment]);

    const appendPaymentPageContent = useCallback(() => {
        if (ref.current.paymentPageContentRef.current && paymentPageContent) {
            ref.current.paymentPageContentRef.current.appendChild(paymentPageContent);
        }
    }, [paymentPageContent]);

    return (
        <>
            <HostedPaymentMethod
                { ...rest }
                initializePayment={ initializeBlueSnapV2Payment }
            />
            <Modal
                additionalModalClassName="modal--bluesnapv2"
                isOpen={ !!paymentPageContent }
                onAfterOpen={ appendPaymentPageContent }
                onRequestClose={ cancelBlueSnapV2ModalFlow }
                shouldShowCloseButton={ true }
            >
                <div ref={ ref.current.paymentPageContentRef } />
            </Modal>
        </>
    );
};

export default BlueSnapV2PaymentMethod;
