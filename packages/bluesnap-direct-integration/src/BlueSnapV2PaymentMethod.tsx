import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createBlueSnapV2PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bluesnap-direct';
import React, {
    createRef,
    type FunctionComponent,
    type RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import {
    HostedPaymentComponent,
    type HostedPaymentComponentProps,
} from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay, Modal } from '@bigcommerce/checkout/ui';

export type BlueSnapV2PaymentMethodProps = HostedPaymentComponentProps;

interface BlueSnapV2PaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelBlueSnapV2Payment?(): void;
}

const BlueSnapV2PaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    paymentForm,
    ...rest
}) => {
    const [isLoadingIframe, setisLoadingIframe] = useState<boolean>(false);
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

    const initializeBlueSnapV2Payment = useCallback(
        (options: PaymentInitializeOptions) => {
            return checkoutService.initializePayment({
                ...options,
                integrations: [createBlueSnapV2PaymentStrategy],
                bluesnapv2: {
                    onLoad(content: HTMLIFrameElement, cancel: () => void) {
                        setPaymentPageContent(content);
                        setisLoadingIframe(true);
                        ref.current.cancelBlueSnapV2Payment = cancel;
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
                setisLoadingIframe(false);
            });
            ref.current.paymentPageContentRef.current.appendChild(paymentPageContent);
        }
    }, [paymentPageContent]);

    return (
        <>
            <HostedPaymentComponent
                {...rest}
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializeBlueSnapV2Payment}
                method={method}
                paymentForm={paymentForm}
            />
            <Modal
                additionalModalClassName="modal--bluesnap"
                isOpen={!!paymentPageContent}
                onAfterOpen={appendPaymentPageContent}
                onRequestClose={cancelBlueSnapV2ModalFlow}
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
    BlueSnapV2PaymentMethod,
    [{ gateway: 'bluesnapv2' }],
);
