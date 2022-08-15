import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, {createRef,
    useCallback,
    useRef,
    useState,
    FunctionComponent,
    RefObject,} from 'react';

import { Modal } from '../../ui/modal';

import HostedCreditCardPaymentMethod, {HostedCreditCardPaymentMethodProps,} from './HostedCreditCardPaymentMethod';

export type WorldpayCreditCardPaymentMethodProps = HostedCreditCardPaymentMethodProps;

interface WorldpayPaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const WorldpayCreditCardPaymentMethod: FunctionComponent<WorldpayCreditCardPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const [threeDSecureVerification, setThreeDSecureVerification] = useState<HTMLElement>();

    const ref = useRef<WorldpayPaymentMethodRef>({
        paymentPageContentRef: createRef(),
    });

    const cancelWorldpayModalFlow = useCallback(() => {
        setThreeDSecureVerification(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);

    const initializeWorldpayPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return initializePayment({
                ...options,
                worldpay: {
                    onLoad(content: HTMLIFrameElement, cancel: () => void) {
                        setThreeDSecureVerification(content);
                        ref.current.cancelThreeDSecureVerification = cancel;
                    },
                },
            });
        },
        [initializePayment],
    );

    const appendPaymentPageContent = useCallback(() => {
        if (threeDSecureVerification) {
            ref.current.paymentPageContentRef.current?.appendChild(threeDSecureVerification);
        }
    }, [threeDSecureVerification]);

    return (
        <>
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
        </>
    );
};

export default WorldpayCreditCardPaymentMethod;
