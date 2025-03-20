import { CardInstrument } from '@bigcommerce/checkout-sdk';
import React, {createRef, FunctionComponent, RefObject, useCallback, useEffect, useRef, useState} from 'react';

import {LocaleProvider, TranslatedString} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { FormContext, LoadingOverlay, Modal } from '@bigcommerce/checkout/ui';

import BraintreeFastlaneForm from './components/BraintreeFastlaneForm';

import './BraintreeFastlanePaymentMethod.scss';

export interface BraintreeFastlaneComponentRef {
    renderPayPalCardComponent?: (container: string) => void;
    showPayPalCardSelector?: () => Promise<CardInstrument | undefined>;
}

interface BraintreeFastlanePaymentMethodRef {
    threeDSecureContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const BraintreeFastlanePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
                                                                                   method,
                                                                                   checkoutService,
                                                                                   checkoutState,
                                                                                   onUnhandledError,
                                                                                   paymentForm,
                                                                               }) => {
    const paypalFastlaneComponentRef = useRef<BraintreeFastlaneComponentRef>({});
    const [threeDSecureContent, setThreeDSecureContent] = useState<HTMLElement>();
    const ref = useRef<BraintreeFastlanePaymentMethodRef>({
        threeDSecureContentRef: createRef(),
    });

    const { isLoadingPaymentMethod, isInitializingPayment } = checkoutState.statuses;

    const initializePaymentOrThrow = async () => {
        try {
            await checkoutService.initializePayment({
                methodId: method.id,
                braintreefastlane: {
                    onInit: (renderPayPalCardComponent) => {
                        paypalFastlaneComponentRef.current.renderPayPalCardComponent =
                            renderPayPalCardComponent;
                    },
                    onChange: (showPayPalCardSelector) => {
                        paypalFastlaneComponentRef.current.showPayPalCardSelector =
                            showPayPalCardSelector;
                    },
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
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

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

    const deinitializePaymentOrThrow = async () => {
        try {
            await checkoutService.deinitializePayment({
                methodId: method.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void initializePaymentOrThrow();

        return () => {
            void deinitializePaymentOrThrow();
        };
    }, []);

    const isLoading = isInitializingPayment() || isLoadingPaymentMethod(method.id);

    const formContextProps = {
        isSubmitted: paymentForm.isSubmitted(),
        setSubmitted: paymentForm.setSubmitted,
    };

    return (
        <FormContext.Provider value={formContextProps}>
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <LocaleProvider checkoutService={checkoutService}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LoadingOverlay hideContentWhenLoading isLoading={isLoading}>
                            <BraintreeFastlaneForm
                                renderPayPalCardComponent={
                                    paypalFastlaneComponentRef?.current?.renderPayPalCardComponent
                                }
                                showPayPalCardSelector={
                                    paypalFastlaneComponentRef.current?.showPayPalCardSelector
                                }
                            />
                            <Modal
                                additionalBodyClassName="modal-body--center"
                                closeButtonLabel={<TranslatedString id="common.close_action" />}
                                isOpen={!!threeDSecureContent}
                                onAfterOpen={appendThreeDSecureContent}
                                onRequestClose={cancelThreeDSecureModalFlow}
                            >
                                <div ref={ref.current.threeDSecureContentRef} />
                            </Modal>
                        </LoadingOverlay>
                    </PaymentFormContext.Provider>
                </LocaleProvider>
            </CheckoutContext.Provider>
        </FormContext.Provider>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeFastlanePaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
