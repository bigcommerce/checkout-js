import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, {
    createRef,
    FunctionComponent,
    RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay, Modal } from '@bigcommerce/checkout/ui';

interface BlueSnapDirectAlternativePaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelBlueSnapDirectPayment?(): void;
}

const BlueSnapDirectAlternativePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    ...rest
}) => {
    const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(false);
    const [paymentPageContent, setPaymentPageContent] = useState<HTMLElement>();
    const ref = useRef<BlueSnapDirectAlternativePaymentMethodRef>({
        paymentPageContentRef: createRef(),
    });

    const cancelBlueSnapDirectModalFlow = useCallback(() => {
        setPaymentPageContent(undefined);

        if (ref.current.cancelBlueSnapDirectPayment) {
            ref.current.cancelBlueSnapDirectPayment();
            ref.current.cancelBlueSnapDirectPayment = undefined;
        }
    }, []);

    const initializeBlueSnapDirectPayment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                gatewayId: options.gatewayId,
                methodId: options.methodId,
                bluesnapdirect: {
                    onLoad(content: HTMLIFrameElement, cancel: () => void) {
                        setPaymentPageContent(content);
                        setIsLoadingIframe(true);
                        ref.current.cancelBlueSnapDirectPayment = cancel;
                    },
                    style: {
                        border: '1px solid lightgray',
                        height: '60vh',
                        width: '100%',
                    },
                },
            });
        },
        [checkoutService],
    );

    const appendPaymentPageContent = useCallback(() => {
        if (ref.current.paymentPageContentRef.current && paymentPageContent) {
            paymentPageContent.addEventListener('load', () => {
                setIsLoadingIframe(false);
            });
            ref.current.paymentPageContentRef.current.appendChild(paymentPageContent);
        }
    }, [paymentPageContent]);

    return (
        <>
            <HostedPaymentComponent
                {...rest}
                checkoutService={checkoutService}
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializeBlueSnapDirectPayment}
            />
            <Modal
                additionalModalClassName="modal--bluesnap"
                isOpen={!!paymentPageContent}
                onAfterOpen={appendPaymentPageContent}
                onRequestClose={cancelBlueSnapDirectModalFlow}
                shouldShowCloseButton={true}
            >
                <LoadingOverlay isLoading={isLoadingIframe}>
                    <div ref={ref.current.paymentPageContentRef} />
                </LoadingOverlay>
            </Modal>
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectAlternativePaymentMethod,
    [{ gateway: 'bluesnapdirect' }],
);
