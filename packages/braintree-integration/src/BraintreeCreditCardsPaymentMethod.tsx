import { type CardInstrument, type LegacyHostedFormOptions } from '@bigcommerce/checkout-sdk';
import { createBraintreeCreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/braintree';
import { compact, forIn } from 'lodash';
import React, {
    createRef,
    type FunctionComponent,
    type ReactNode,
    type RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import {
    CreditCardPaymentMethodComponent,
    type CreditCardPaymentMethodProps,
} from '@bigcommerce/checkout/credit-card-integration';
import {
    getHostedCreditCardValidationSchema,
    getHostedInstrumentValidationSchema,
    HostedCreditCardFieldset,
    HostedCreditCardValidation,
} from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

interface BraintreeCreditCardPaymentMethodRef {
    threeDSecureContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const BraintreeCreditCardsPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { checkoutService, checkoutState, paymentForm, language, method, onUnhandledError } =
        props;
    const { isHostedFormEnabled } = method.config;

    const [threeDSecureContent, setThreeDSecureContent] = useState<HTMLElement>();
    const [focusedFieldType, setFocusedFieldType] = useState<string>();

    const ref = useRef<BraintreeCreditCardPaymentMethodRef>({
        threeDSecureContentRef: createRef(),
    });

    const { cardCode, showCardHolderName, requireCustomerCode } = method.config;
    const { setFieldTouched, setFieldValue, setSubmitted, submitForm } = paymentForm;
    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);

    const isCardCodeRequired = cardCode || cardCode === null;
    const isCardHolderNameRequired = showCardHolderName ?? true;

    const getHostedFieldId: (name: string) => string = useCallback(
        (name) => {
            return `${compact([method.gateway, method.id]).join('-')}-${name}`;
        },
        [method],
    );

    const getHostedFormOptions: (
        selectedInstrument?: CardInstrument,
    ) => Promise<LegacyHostedFormOptions> = useCallback(
        async (selectedInstrument) => {
            const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];

            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;

            // Info: to generate valid nonce for vaulted instrument with untrusted shipping address, all hosted fields must be rendered
            const shouldRenderHostedFields =
                isInstrumentCardNumberRequired || isInstrumentCardCodeRequired;

            let styleContainerId;

            if (selectedInstrument && shouldRenderHostedFields) {
                styleContainerId = getHostedFieldId('ccCvv');
            }

            if (!selectedInstrument) {
                styleContainerId = getHostedFieldId('ccNumber');
            }

            return {
                fields: selectedInstrument
                    ? {
                          cardCodeVerification:
                              isInstrumentCardCodeRequired && selectedInstrument
                                  ? {
                                        accessibilityLabel: language.translate(
                                            'payment.credit_card_cvv_label',
                                        ),
                                        containerId: getHostedFieldId('ccCvv'),
                                        instrumentId: selectedInstrument.bigpayToken,
                                    }
                                  : undefined,
                          cardNumberVerification:
                              isInstrumentCardNumberRequired && selectedInstrument
                                  ? {
                                        accessibilityLabel: language.translate(
                                            'payment.credit_card_number_label',
                                        ),
                                        containerId: getHostedFieldId('ccNumber'),
                                        instrumentId: selectedInstrument.bigpayToken,
                                    }
                                  : undefined,
                      }
                    : {
                          cardCode: isCardCodeRequired
                              ? {
                                    accessibilityLabel: language.translate(
                                        'payment.credit_card_cvv_label',
                                    ),
                                    containerId: getHostedFieldId('ccCvv'),
                                }
                              : undefined,
                          cardExpiry: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_expiration_label',
                              ),
                              containerId: getHostedFieldId('ccExpiry'),
                              placeholder: language.translate(
                                  'payment.credit_card_expiration_placeholder_text',
                              ),
                          },
                          cardName: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_name_label',
                              ),
                              containerId: getHostedFieldId('ccName'),
                          },
                          cardNumber: {
                              accessibilityLabel: language.translate(
                                  'payment.credit_card_number_label',
                              ),
                              containerId: getHostedFieldId('ccNumber'),
                          },
                      },
                styles: styleContainerId
                    ? {
                          default: await getCreditCardInputStyles(styleContainerId, styleProps),
                          error: await getCreditCardInputStyles(
                              styleContainerId,
                              styleProps,
                              CreditCardInputStylesType.Error,
                          ),
                          focus: await getCreditCardInputStyles(
                              styleContainerId,
                              styleProps,
                              CreditCardInputStylesType.Focus,
                          ),
                      }
                    : {},
                onBlur: ({ fieldType }) => {
                    if (focusedFieldType === fieldType) {
                        setFocusedFieldType(undefined);
                    }
                },
                onCardTypeChange: ({ cardType }) => {
                    setFieldValue('hostedForm.cardType', cardType);
                },
                onEnter: () => {
                    setSubmitted(true);
                    submitForm();
                },
                onFocus: ({ fieldType }) => {
                    setFocusedFieldType(fieldType);
                },
                onValidate: ({ errors = {} }) => {
                    forIn(errors, (fieldErrors, fieldType) => {
                        const errorKey = `hostedForm.errors.${fieldType}`;

                        setFieldValue(
                            errorKey,
                            fieldErrors && fieldErrors[0].type ? fieldErrors[0].type : '',
                        );

                        if (fieldErrors && fieldErrors[0]) {
                            setFieldTouched(errorKey);
                        }
                    });
                },
            };
        },
        [
            focusedFieldType,
            getHostedFieldId,
            isCardCodeRequired,
            isCardHolderNameRequired,
            isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequiredProp,
            language,
            method,
            setFieldValue,
            setFieldTouched,
            setFocusedFieldType,
            setSubmitted,
            submitForm,
        ],
    );

    const getHostedStoredCardValidationFieldset: (
        selectedInstrument?: CardInstrument,
    ) => ReactNode = useCallback(
        (selectedInstrument) => {
            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument, method)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;

            return (
                <HostedCreditCardValidation
                    cardCodeId={
                        isInstrumentCardCodeRequired ? getHostedFieldId('ccCvv') : undefined
                    }
                    cardNumberId={
                        isInstrumentCardNumberRequired ? getHostedFieldId('ccNumber') : undefined
                    }
                    focusedFieldType={focusedFieldType}
                />
            );
        },
        [
            focusedFieldType,
            getHostedFieldId,
            isInstrumentCardCodeRequiredProp,
            isInstrumentCardNumberRequiredProp,
            method,
        ],
    );

    const initializePayment = checkoutService.initializePayment;

    const initializeBraintreePayment: CreditCardPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    integrations: [createBraintreeCreditCardPaymentStrategy],
                    braintree: {
                        threeDSecure: {
                            addFrame(
                                error: Error | undefined,
                                content: HTMLIFrameElement,
                                cancel: () => Promise<unknown> | undefined,
                            ) {
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
                        onPaymentError(error: Error) {
                            if (error.message === 'THREEDS_VERIFICATION_FAILED') {
                                onUnhandledError?.(
                                    new Error(
                                        language.translate(
                                            'payment.errors.three_d_secure_payment_failed',
                                        ),
                                    ),
                                );
                            } else {
                                onUnhandledError?.(error);
                            }
                        },
                        form: isHostedFormEnabled
                            ? await getHostedFormOptions(selectedInstrument)
                            : undefined,
                    },
                });
            },
            [getHostedFormOptions, initializePayment, onUnhandledError],
        );

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

    if (!method.config.isHostedFormEnabled) {
        return (
            <CreditCardPaymentMethodComponent
                {...props}
                deinitializePayment={checkoutService.deinitializePayment}
                initializePayment={initializeBraintreePayment}
            />
        );
    }

    return (
        <>
            <CreditCardPaymentMethodComponent
                {...props}
                cardFieldset={
                    <HostedCreditCardFieldset
                        additionalFields={
                            requireCustomerCode && (
                                <CreditCardCustomerCodeField name="ccCustomerCode" />
                            )
                        }
                        cardCodeId={isCardCodeRequired ? getHostedFieldId('ccCvv') : undefined}
                        cardExpiryId={getHostedFieldId('ccExpiry')}
                        cardNameId={getHostedFieldId('ccName')}
                        cardNumberId={getHostedFieldId('ccNumber')}
                        focusedFieldType={focusedFieldType}
                    />
                }
                cardValidationSchema={getHostedCreditCardValidationSchema({ language })}
                deinitializePayment={checkoutService.deinitializePayment}
                getHostedFormOptions={getHostedFormOptions}
                getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
                initializePayment={initializeBraintreePayment}
                storedCardValidationSchema={getHostedInstrumentValidationSchema({
                    language,
                    isCardExpiryRequired: true,
                })}
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
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeCreditCardsPaymentMethod,
    [{ id: 'braintree' }],
);
