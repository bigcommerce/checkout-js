import {
    CardInstrument,
    CustomError,
    PaymentInitializeOptions,
    StripeElementOptions,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';

import { TranslatedString, withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import StripeV3CustomCardForm from './StripeV3CustomCardForm';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

export interface StripeOptions {
    alipay?: StripeElementOptions;
    card: StripeElementOptions;
    cardCvc: StripeElementOptions;
    cardExpiry: StripeElementOptions;
    cardNumber: StripeElementOptions;
    iban: StripeElementOptions;
    idealBank: StripeElementOptions;
}

interface WithCheckoutStripePaymentMethodProps {
    storeUrl: string;
}

export enum StripeElementType {
    alipay = 'alipay',
    card = 'card',
    cardCvc = 'cardCvc',
    cardExpiry = 'cardExpiry',
    cardNumber = 'cardNumber',
    iban = 'iban',
    idealBank = 'idealBank',
}

const StripePaymentMethod: FunctionComponent<
    StripePaymentMethodProps &
        WithLanguageProps &
        WithInjectedHostedCreditCardFieldsetProps &
        WithCheckoutStripePaymentMethodProps
> = ({
    initializePayment,
    getHostedFormOptions,
    getHostedStoredCardValidationFieldset,
    hostedStoredCardValidationSchema,
    method,
    storeUrl,
    onUnhandledError = noop,
    language,
    ...rest
}) => {
    const { useIndividualCardFields } = method.initializationData;
    const paymentMethodType = method.id as StripeElementType;
    const additionalStripeV3Classes =
        paymentMethodType !== StripeElementType.alipay
            ? 'optimizedCheckout-form-input widget--stripev3'
            : '';
    const containerId = `stripe-${paymentMethodType}-component-field`;
    const classes = {
        base: 'form-input optimizedCheckout-form-input',
    };
    const stripeOptions: StripeOptions = {
        [StripeElementType.card]: {
            classes,
        },
        [StripeElementType.cardCvc]: {
            classes,
            placeholder: '',
        },
        [StripeElementType.cardExpiry]: {
            classes,
        },
        [StripeElementType.cardNumber]: {
            classes,
            showIcon: true,
            placeholder: '',
        },
        [StripeElementType.iban]: {
            classes,
            supportedCountries: ['SEPA'],
        },
        [StripeElementType.idealBank]: {
            classes,
        },
    };

    const onUnhandledStripeV3Error = useCallback(
        (error: CustomError) => {
            if (error.type === 'stripev3_error' && error.subtype === 'auth_failure') {
                error.message = language.translate('payment.stripev3_auth_3ds_fail');
            }

            onUnhandledError(error);
        },
        [language, onUnhandledError],
    );

    const getIndividualCardElementOptions = useCallback(
        (stripeInitializeOptions: StripeOptions) => {
            return {
                cardNumberElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.cardNumber],
                    containerId: 'stripe-card-number-component-field',
                },
                cardExpiryElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.cardExpiry],
                    containerId: 'stripe-expiry-component-field',
                },
                cardCvcElementOptions: {
                    ...stripeInitializeOptions[StripeElementType.cardCvc],
                    containerId: 'stripe-cvc-component-field',
                },
            };
        },
        [],
    );

    const getStripeOptions = useCallback(
        (stripeInitializeOptions: StripeOptions) => {
            if (useIndividualCardFields) {
                return getIndividualCardElementOptions(stripeInitializeOptions);
            }

            return stripeInitializeOptions[paymentMethodType];
        },
        [paymentMethodType, getIndividualCardElementOptions, useIndividualCardFields],
    );

    const initializeStripePayment: HostedWidgetPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options: PaymentInitializeOptions, selectedInstrument) => {
                return initializePayment({
                    ...options,
                    stripev3: {
                        containerId,
                        options: getStripeOptions(stripeOptions),
                        ...(selectedInstrument && {
                            form: await getHostedFormOptions(selectedInstrument),
                        }),
                    },
                });
            },
            [initializePayment, containerId, getStripeOptions, stripeOptions, getHostedFormOptions],
        );

    const renderCustomPaymentForm = () => {
        const optionsCustomForm = getIndividualCardElementOptions(stripeOptions);

        return <StripeV3CustomCardForm options={optionsCustomForm} />;
    };

    function validateInstrument(_shouldShowNumber: boolean, selectedInstrument: CardInstrument) {
        return getHostedStoredCardValidationFieldset(selectedInstrument);
    }

    return (
        <>
            <HostedWidgetPaymentMethod
                {...rest}
                additionalContainerClassName={additionalStripeV3Classes}
                containerId={containerId}
                hideContentWhenSignedOut
                initializePayment={initializeStripePayment}
                method={method}
                onUnhandledError={onUnhandledStripeV3Error}
                renderCustomPaymentForm={renderCustomPaymentForm}
                shouldRenderCustomInstrument={useIndividualCardFields}
                storedCardValidationSchema={hostedStoredCardValidationSchema}
                validateInstrument={validateInstrument}
            />
            {method.id === 'iban' && (
                <p className="stripe-sepa-mandate-disclaimer">
                    <TranslatedString
                        data={{ storeUrl }}
                        id="payment.stripe_sepa_mandate_disclaimer"
                    />
                </p>
            )}
        </>
    );
};

function mapFromCheckoutProps({ checkoutState }: CheckoutContextProps) {
    const {
        data: { getConfig },
    } = checkoutState;
    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        storeUrl: config.links.siteLink,
    };
}

export default withLanguage(
    withHostedCreditCardFieldset(withCheckout(mapFromCheckoutProps)(StripePaymentMethod)),
);
