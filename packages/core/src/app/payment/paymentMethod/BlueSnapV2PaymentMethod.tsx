import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, {
    createRef,
    FunctionComponent,
    RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import { LoadingOverlay } from '../../ui/loading';
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
            return initializePayment({
                ...options,
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
        [initializePayment],
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
            <HostedPaymentMethod {...rest} initializePayment={initializeBlueSnapV2Payment} />
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

export default BlueSnapV2PaymentMethod;
