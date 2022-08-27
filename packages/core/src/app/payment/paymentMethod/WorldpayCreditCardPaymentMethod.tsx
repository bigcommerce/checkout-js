import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { createRef, useCallback, useRef, useState, FunctionComponent, RefObject } from 'react';

import { Modal } from '../../ui/modal';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';
import { withHostedCreditCardFieldset, WithInjectedHostedCreditCardFieldsetProps } from '../hostedCreditCard';

export type WorldpayCreditCardPaymentMethodProps = CreditCardPaymentMethodProps;

interface WorldpayPaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const WorldpayCreditCardPaymentMethod: FunctionComponent<
    WorldpayCreditCardPaymentMethodProps &
    WithInjectedHostedCreditCardFieldsetProps
> = ({
    getHostedFormOptions,
    hostedFieldset,
    hostedValidationSchema,
    getHostedStoredCardValidationFieldset,
    hostedStoredCardValidationSchema,
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

    const initializeWorldpayPayment = useCallback(async (options: PaymentInitializeOptions, selectedInstrument) => {
        const fields = getHostedFormOptions && await getHostedFormOptions(selectedInstrument);

        return initializePayment({
            ...options,
            creditCard: {
                form: fields,
            },
            worldpay: {
                onLoad(content: HTMLIFrameElement, cancel: () => void) {
                    setThreeDSecureVerification(content);
                    ref.current.cancelThreeDSecureVerification = cancel;
                },
            },
        });
    }, [initializePayment]);

    const appendPaymentPageContent = useCallback(() => {
        if (threeDSecureVerification) {
            ref.current.paymentPageContentRef.current?.appendChild(threeDSecureVerification);
        }
    }, [threeDSecureVerification]);

    return <>
        <CreditCardPaymentMethod
            { ...rest }
            cardFieldset={ hostedFieldset }
            cardValidationSchema={ hostedValidationSchema }
            getStoredCardValidationFieldset={ getHostedStoredCardValidationFieldset }
            initializePayment={ initializeWorldpayPayment }
            storedCardValidationSchema={ hostedStoredCardValidationSchema }
        />
        <Modal
            isOpen={ !!threeDSecureVerification }
            onAfterOpen={ appendPaymentPageContent }
            onRequestClose={ cancelWorldpayModalFlow }
            shouldShowCloseButton={ true }
        >
            <div ref={ ref.current.paymentPageContentRef } />
        </Modal>
    </>;
};

export default withHostedCreditCardFieldset(WorldpayCreditCardPaymentMethod);
