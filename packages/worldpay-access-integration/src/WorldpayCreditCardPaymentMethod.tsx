import {
    type CardInstrument,
    type LegacyHostedFormOptions,
    type PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { compact, forIn } from 'lodash';
import React, {
    createRef,
    type FunctionComponent,
    type RefObject,
    useCallback,
    useRef,
    useState,
} from 'react';

import { CreditCardPaymentMethodComponent } from '@bigcommerce/checkout/credit-card-integration';
import {
    getHostedCreditCardValidationSchema,
    getHostedInstrumentValidationSchema,
    HostedCreditCardFieldset,
    useHostedCreditCard,
} from '@bigcommerce/checkout/hosted-credit-card-integration';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
    isInstrumentCardCodeRequiredSelector,
    isInstrumentCardNumberRequiredSelector,
} from '@bigcommerce/checkout/instrument-utils';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { Modal } from '@bigcommerce/checkout/ui';

interface WorldpayPaymentMethodRef {
    paymentPageContentRef: RefObject<HTMLDivElement>;
    cancelThreeDSecureVerification?(): void;
}

const WorldpayCreditCardPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    language,
    paymentForm,
    checkoutState,
    checkoutService,
    method,
    ...rest
}) => {
    const [threeDSecureVerification, setThreeDSecureVerification] = useState<HTMLElement>();
    const [focusedFieldType, setFocusedFieldType] = useState<string>();
    const { getHostedStoredCardValidationFieldset } = useHostedCreditCard({
        checkoutState,
        method,
        language,
        paymentForm,
    });
    const { setFieldTouched, setFieldValue, setSubmitted, submitForm } = paymentForm;

    const isInstrumentCardCodeRequiredProp = isInstrumentCardCodeRequiredSelector(checkoutState);
    const isInstrumentCardNumberRequiredProp =
        isInstrumentCardNumberRequiredSelector(checkoutState);

    const {
        config: { cardCode },
    } = method;
    const isCardCodeRequired = cardCode || cardCode === null;
    const getHostedFieldId: (name: string) => string = useCallback(
        (name) => {
            return `${compact([method.gateway, method.id]).join('-')}-${name}`;
        },
        [method],
    );

    const hostedStoredCardValidationSchema = getHostedInstrumentValidationSchema({ language });

    const ref = useRef<WorldpayPaymentMethodRef>({
        paymentPageContentRef: createRef(),
    });
    const getHostedFormOptions: (
        selectedInstrument?: CardInstrument,
    ) => Promise<LegacyHostedFormOptions> = useCallback(
        async (selectedInstrument) => {
            const styleProps = ['color', 'fontFamily', 'fontSize', 'fontWeight'];
            const isInstrumentCardNumberRequired = selectedInstrument
                ? isInstrumentCardNumberRequiredProp(selectedInstrument)
                : false;
            const isInstrumentCardCodeRequired = selectedInstrument
                ? isInstrumentCardCodeRequiredProp(selectedInstrument, method)
                : false;
            const styleContainerId = selectedInstrument
                ? isInstrumentCardCodeRequired
                    ? getHostedFieldId('ccCvv')
                    : undefined
                : getHostedFieldId('ccNumber');

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
                    forIn(errors, (fieldErrors = [], fieldType) => {
                        const errorKey = `hostedForm.errors.${fieldType}`;

                        setFieldValue(errorKey, fieldErrors[0]?.type ?? '');

                        if (fieldErrors[0]) {
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
    const cancelWorldpayModalFlow = useCallback(() => {
        setThreeDSecureVerification(undefined);

        if (ref.current.cancelThreeDSecureVerification) {
            ref.current.cancelThreeDSecureVerification();
            ref.current.cancelThreeDSecureVerification = undefined;
        }
    }, []);
    const initializeWorldpayPayment = useCallback(
        async (options: PaymentInitializeOptions, selectedInstrument: any) => {
            return checkoutService.initializePayment({
                ...options,
                creditCard: {
                    form: getHostedFormOptions && (await getHostedFormOptions(selectedInstrument)),
                },
                worldpay: {
                    onLoad(content: HTMLIFrameElement, cancel: () => void) {
                        setThreeDSecureVerification(content);
                        ref.current.cancelThreeDSecureVerification = cancel;
                    },
                },
            });
        },
        [checkoutService, getHostedFormOptions],
    );
    const hostedValidationSchema = getHostedCreditCardValidationSchema({ language });

    const appendPaymentPageContent = useCallback(() => {
        if (threeDSecureVerification) {
            ref.current.paymentPageContentRef.current?.appendChild(threeDSecureVerification);
        }
    }, [threeDSecureVerification]);

    return (
        <>
            <CreditCardPaymentMethodComponent
                {...rest}
                cardFieldset={
                    <HostedCreditCardFieldset
                        additionalFields={
                            method.config.requireCustomerCode && (
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
                cardValidationSchema={hostedValidationSchema}
                checkoutService={checkoutService}
                checkoutState={checkoutState}
                deinitializePayment={checkoutService.deinitializePayment}
                getStoredCardValidationFieldset={getHostedStoredCardValidationFieldset}
                initializePayment={initializeWorldpayPayment}
                language={language}
                method={method}
                paymentForm={paymentForm}
                storedCardValidationSchema={hostedStoredCardValidationSchema}
            />
            <Modal
                isOpen={!!threeDSecureVerification}
                onAfterOpen={appendPaymentPageContent}
                onRequestClose={cancelWorldpayModalFlow}
                shouldShowCloseButton={true}
            >
                <div ref={ref.current.paymentPageContentRef} />
            </Modal>
        </>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    WorldpayCreditCardPaymentMethod,
    [{ id: 'worldpayaccess' }],
);
