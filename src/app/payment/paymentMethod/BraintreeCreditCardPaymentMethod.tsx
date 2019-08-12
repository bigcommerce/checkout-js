import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';

import { TranslatedString } from '../../language';
import { Modal } from '../../ui/modal';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';

export type BraintreeCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

interface BraintreeCreditCardPaymentMethodRef {
    threeDSecureContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const BraintreeCreditCardPaymentMethod: FunctionComponent<BraintreeCreditCardPaymentMethodProps> = ({
    initializePayment,
    onUnhandledError = noop,
    ...rest
}) => {
    const [threeDSecureContent, setThreeDSecureContent] = useState<HTMLElement>();
    const ref = useRef<BraintreeCreditCardPaymentMethodRef>({
        threeDSecureContentRef: createRef(),
    });

    const initializeBraintreePayment = useCallback((options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            braintree: {
                threeDSecure: {
                    addFrame(error, content, cancel) {
                        if (error) {
                            return onUnhandledError(error);
                        }

                        setThreeDSecureContent(content);
                        ref.current.cancelThreeDSecureVerification = cancel;
                    },
                    removeFrame() {
                        setThreeDSecureContent(undefined);
                        ref.current.cancelThreeDSecureVerification = undefined;
                    },
                },
            },
        });
    }, [initializePayment, onUnhandledError]);

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

    return <>
        <CreditCardPaymentMethod
            { ...rest }
            initializePayment={ initializeBraintreePayment }
        />

        <Modal
            additionalBodyClassName="modal-body--center"
            closeButtonLabel={ <TranslatedString id="common.close_action" /> }
            isOpen={ !!threeDSecureContent }
            onAfterOpen={ appendThreeDSecureContent }
            onRequestClose={ cancelThreeDSecureModalFlow }
        >
            <div ref={ ref.current.threeDSecureContentRef } />
        </Modal>
    </>;
};

export default BraintreeCreditCardPaymentMethod;
