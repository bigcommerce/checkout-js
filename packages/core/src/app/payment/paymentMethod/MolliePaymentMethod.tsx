import { CardInstrument, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/locale';

import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import MollieCustomCardForm from './MollieCustomCardForm';

export type MolliePaymentMethodsProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

export enum MolliePaymentMethodType {
    creditcard = 'credit_card',
}

const MolliePaymentMethod: FunctionComponent<
    MolliePaymentMethodsProps & WithInjectedHostedCreditCardFieldsetProps
> = ({
    initializePayment,
    method,
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedStoredCardValidationSchema,
    ...props
}) => {
    const paymentContext = useContext(PaymentContext);
    const localeContext = useContext(LocaleContext);
    const containerId = `mollie-${method.method}`;
    const initializeMolliePayment: HostedWidgetPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options: PaymentInitializeOptions, selectedInstrument) => {
                const mollieElements = getMolliesElementOptions();

                return initializePayment({
                    ...options,
                    mollie: {
                        containerId,
                        cardNumberId: mollieElements.cardNumberElementOptions.containerId,
                        cardCvcId: mollieElements.cardCvcElementOptions.containerId,
                        cardHolderId: mollieElements.cardHolderElementOptions.containerId,
                        cardExpiryId: mollieElements.cardExpiryElementOptions.containerId,
                        styles: {
                            base: {
                                color: '#333333',
                                '::placeholder': {
                                    color: '#999999',
                                },
                            },
                            valid: {
                                color: '#090',
                            },
                            invalid: {
                                color: '#D14343',
                            },
                        },
                        unsupportedMethodMessage: localeContext?.language.translate(
                            'payment.mollie_unsupported_method_error',
                        ),
                        disableButton: (disabled: boolean) => {
                            if (paymentContext) {
                                paymentContext.disableSubmit(method, disabled);
                            }
                        },
                        ...(selectedInstrument && {
                            form: await getHostedFormOptions(selectedInstrument),
                        }),
                    },
                });
            },
            [
                initializePayment,
                containerId,
                getHostedFormOptions,
                paymentContext,
                method,
                localeContext,
            ],
        );

    const getMolliesElementOptions = () => {
        return {
            cardNumberElementOptions: {
                containerId: 'mollie-card-number-component-field',
            },
            cardExpiryElementOptions: {
                containerId: 'mollie-card-expiry-component-field',
            },
            cardCvcElementOptions: {
                containerId: 'mollie-card-cvc-component-field',
            },
            cardHolderElementOptions: {
                containerId: 'mollie-card-holder-component-field',
            },
        };
    };

    function renderCustomPaymentForm() {
        const options = getMolliesElementOptions();

        return (
            <MollieCustomCardForm isCreditCard={isCreditCard()} method={method} options={options} />
        );
    }

    function isCreditCard(): boolean {
        return method.method === MolliePaymentMethodType.creditcard;
    }

    function validateInstrument(_shouldShowNumber: boolean, selectedInstrument: CardInstrument) {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    }

    return (
        <HostedWidgetPaymentMethod
            {...props}
            containerId={containerId}
            hideContentWhenSignedOut
            initializePayment={initializeMolliePayment}
            isAccountInstrument={!isCreditCard()}
            method={method}
            renderCustomPaymentForm={renderCustomPaymentForm}
            shouldRenderCustomInstrument={true}
            storedCardValidationSchema={hostedStoredCardValidationSchema}
            validateInstrument={validateInstrument}
        />
    );
};

export default withHostedCreditCardFieldset(MolliePaymentMethod);
