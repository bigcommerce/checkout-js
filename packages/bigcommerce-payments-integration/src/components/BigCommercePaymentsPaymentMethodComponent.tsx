import {
    type AccountInstrument,
    type HostedInstrument,
    type BigCommercePaymentsPaymentInitializeOptions,
    type BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions,
    type BigCommercePaymentsCreditCardsPaymentInitializeOptions,
    type BigCommercePaymentsVenmoPaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import {
    createBigCommercePaymentsPaymentStrategy,
    createBigCommercePaymentsAlternativeMethodsPaymentStrategy,
    createBigCommercePaymentsPayLaterPaymentStrategy,
    createBigCommercePaymentsVenmoPaymentStrategy,
    createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent, useCallback, useEffect, useRef } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

type BigCommercePaymentsProvidersPaymentInitializeOptions =
    BigCommercePaymentsAlternativeMethodsPaymentInitializeOptions &
        BigCommercePaymentsCreditCardsPaymentInitializeOptions &
        BigCommercePaymentsPaymentInitializeOptions &
        BigCommercePaymentsVenmoPaymentInitializeOptions;

interface BigCommercePaymentsPaymentMethodComponentProps {
    providerOptionsKey: string;
    providerOptionsData?: Partial<BigCommercePaymentsProvidersPaymentInitializeOptions>;
    currentInstrument?: AccountInstrument;
    shouldConfirmInstrument?: boolean;
}

interface ButtonActions {
    disable: () => void;
    enable: () => void;
}

const BigCommercePaymentsPaymentMethodComponent: FunctionComponent<
    PaymentMethodProps & BigCommercePaymentsPaymentMethodComponentProps
> = ({
    method,
    checkoutService,
    paymentForm,
    onUnhandledError,
    providerOptionsKey,
    providerOptionsData,
    children,
    currentInstrument,
    language,
    shouldConfirmInstrument,
}) => {
    const buttonActionsRef = useRef<ButtonActions | null>(null);
    const fieldsValuesRef = useRef<HostedInstrument | null>(null);
    const renderButtonRef = useRef<(() => void) | null>(null);
    const hasPayPalButton = useRef(false);

    const termsValue = paymentForm.getFieldValue('terms');
    const shouldSaveInstrument = paymentForm.getFieldValue('shouldSaveInstrument');

    const validateForm = async () => {
        const validationErrors = await paymentForm.validateForm();

        return Object.keys(validationErrors);
    };

    const validateButton = async () => {
        if (!buttonActionsRef.current) return;

        const keysValidation = await validateForm();

        if (keysValidation.length) {
            buttonActionsRef.current.disable();
        } else {
            buttonActionsRef.current.enable();
        }
    };

    const togglePaypalButton = useCallback(() => {
        if (currentInstrument && !shouldConfirmInstrument) {
            paymentForm.hidePaymentSubmitButton(method, false);
            hasPayPalButton.current = false;
        } else if (!hasPayPalButton.current && renderButtonRef.current) {
            paymentForm.hidePaymentSubmitButton(method, true);

            setTimeout(() => {
                renderButtonRef.current?.();

                hasPayPalButton.current = true;
            }, 0);
        }
    }, [currentInstrument]);

    useEffect(() => {
        togglePaypalButton();
    }, [togglePaypalButton, renderButtonRef.current]);

    useEffect(() => {
        void validateButton();
    }, [termsValue]);

    useEffect(() => {
        fieldsValuesRef.current = {
            shouldSaveInstrument: shouldConfirmInstrument || Boolean(shouldSaveInstrument),
        };
    }, [shouldSaveInstrument, shouldConfirmInstrument]);

    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                integrations: [
                    createBigCommercePaymentsPaymentStrategy,
                    createBigCommercePaymentsAlternativeMethodsPaymentStrategy,
                    createBigCommercePaymentsPayLaterPaymentStrategy,
                    createBigCommercePaymentsVenmoPaymentStrategy,
                    createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy,
                ],
                [providerOptionsKey]: {
                    container: '#checkout-payment-continue',
                    shouldRenderPayPalButtonOnInitialization: false,
                    onRenderButton: () => {
                        paymentForm.hidePaymentSubmitButton(method, true);
                    },
                    onInit: (onRenderButton: () => void) => {
                        renderButtonRef.current = onRenderButton;
                    },
                    submitForm: () => {
                        paymentForm.setSubmitted(true);
                        paymentForm.submitForm();
                    },
                    onError: (error: Error) => {
                        paymentForm.disableSubmit(method, true);

                        if (error.message === 'INSTRUMENT_DECLINED') {
                            onUnhandledError(
                                new Error(language.translate('payment.errors.instrument_declined')),
                            );
                        } else {
                            onUnhandledError(error);
                        }
                    },
                    onValidate: async (resolve: () => void, reject: () => void): Promise<void> => {
                        const keysValidation = await validateForm();

                        if (keysValidation.length) {
                            paymentForm.setSubmitted(true);
                            keysValidation.forEach((key) => paymentForm.setFieldTouched(key));

                            return reject();
                        }

                        return resolve();
                    },
                    onInitButton: async (actions: ButtonActions) => {
                        buttonActionsRef.current = actions;
                        await validateButton();
                    },
                    getFieldsValues: () => fieldsValuesRef.current,
                    ...(providerOptionsData || {}),
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializePayment = async () => {
        try {
            await checkoutService.deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, []);

    return children ? <>{children}</> : <></>;
};

export default BigCommercePaymentsPaymentMethodComponent;
