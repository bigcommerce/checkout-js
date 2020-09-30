import { PaymentInitializeOptions, StripeElementOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { TranslatedString } from '../../locale';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
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
const StripePaymentMethod: FunctionComponent<StripePaymentMethodProps & WithCheckoutStripePaymentMethodProps> = ({
      initializePayment,
      method,
      storeUrl,
      ...rest
  }) => {
    const { useIndividualCardFields } = method.initializationData;
    const paymentMethodType = method.id as StripeElementType;
    const additionalStripeV3Classes = paymentMethodType !== StripeElementType.alipay ? 'optimizedCheckout-form-input widget--stripev3' : '';
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

    const getIndividualCardElementOptions = useCallback((stripeInitializeOptions: StripeOptions) => {
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
            zipCodeElementOptions: {
                containerId: 'stripe-postal-code-component-field',
            },
        };
    }, []);

    const getStripeOptions = useCallback((shouldRenderCustomComponents: boolean, stripeInitializeOptions: StripeOptions) => {
        if (shouldRenderCustomComponents) {
            return getIndividualCardElementOptions(stripeInitializeOptions);
        }

        return stripeInitializeOptions[paymentMethodType];
    }, [paymentMethodType, getIndividualCardElementOptions]);

    const initializeStripePayment = useCallback(async (options: PaymentInitializeOptions) => {
        return initializePayment({
            ...options,
            stripev3: { containerId,
                options: getStripeOptions(useIndividualCardFields, stripeOptions) },
        });
    }, [initializePayment, containerId, getStripeOptions, useIndividualCardFields, stripeOptions]);

    const renderCustomPaymentForm = () => {
        const optionsCustomForm = getIndividualCardElementOptions(stripeOptions);

        return <StripeV3CustomCardForm options={ optionsCustomForm } />;
    };

    return <>
        <HostedWidgetPaymentMethod
            { ...rest }
            additionalContainerClassName= { additionalStripeV3Classes }
            containerId={ containerId }
            hideContentWhenSignedOut
            initializePayment={ initializeStripePayment }
            method={ method }
            renderCustomPaymentForm={ renderCustomPaymentForm }
            shouldRenderCustomInstrument={ useIndividualCardFields }
        />
        {
            method.id === 'iban' &&
                <p className="stripe-sepa-mandate-disclaimer">
                    <TranslatedString data={ {storeUrl} } id="payment.stripe_sepa_mandate_disclaimer" />
                </p>
        }
    </>;
};

function mapFromCheckoutProps(
    { checkoutState }: CheckoutContextProps) {
    const { data: { getConfig } } = checkoutState;
    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        storeUrl: config.links.siteLink,
    };
}
export default withCheckout(mapFromCheckoutProps)(StripePaymentMethod);
