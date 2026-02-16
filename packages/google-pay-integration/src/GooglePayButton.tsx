import {
    createGooglePayAdyenV2CustomerStrategy,
    createGooglePayAdyenV3CustomerStrategy,
    createGooglePayAuthorizeDotNetCustomerStrategy,
    createGooglePayBigCommercePaymentsCustomerStrategy,
    createGooglePayBnzCustomerStrategy,
    createGooglePayBraintreeCustomerStrategy,
    createGooglePayCheckoutComCustomerStrategy,
    createGooglePayCybersourceCustomerStrategy,
    createGooglePayOrbitalCustomerStrategy,
    createGooglePayPayPalCommerceCustomerStrategy,
    createGooglePayStripeCustomerStrategy,
    createGooglePayStripeUpeCustomerStrategy,
    createGooglePayTdOnlineMartCustomerStrategy,
    createGooglePayWorldpayAccessCustomerStrategy,
} from '@bigcommerce/checkout-sdk/integrations/google-pay';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    EmbeddedCheckoutUnsupportedError,
    isEmbedded,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import './GooglePayButton.scss';

const GooglePayButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const { language, onUnhandledError } = props;

    if (isEmbedded()) {
        onUnhandledError(
            new EmbeddedCheckoutUnsupportedError(
                language.translate('embedded_checkout.unsupported_error', {
                    methods: 'googlepay',
                }),
            ),
        );

        return null;
    }

    const integrations = [
        createGooglePayAdyenV2CustomerStrategy,
        createGooglePayAdyenV3CustomerStrategy,
        createGooglePayAuthorizeDotNetCustomerStrategy,
        createGooglePayCheckoutComCustomerStrategy,
        createGooglePayCybersourceCustomerStrategy,
        createGooglePayBnzCustomerStrategy,
        createGooglePayOrbitalCustomerStrategy,
        createGooglePayStripeCustomerStrategy,
        createGooglePayStripeUpeCustomerStrategy,
        createGooglePayWorldpayAccessCustomerStrategy,
        createGooglePayBraintreeCustomerStrategy,
        createGooglePayPayPalCommerceCustomerStrategy,
        createGooglePayBigCommercePaymentsCustomerStrategy,
        createGooglePayTdOnlineMartCustomerStrategy,
    ];

    return (
        <CheckoutButton
            checkoutButtonContainerClass="google-pay-top-button"
            integrations={integrations}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    GooglePayButton,
    [
        { id: 'googlepayadyenv2' },
        { id: 'googlepayadyenv3' },
        { id: 'googlepayauthorizenet' },
        { id: 'googlepaybnz' },
        { id: 'googlepaybraintree' },
        { id: 'googlepaypaypalcommerce' },
        { id: 'googlepaycheckoutcom' },
        { id: 'googlepaycybersourcev2' },
        { id: 'googlepayorbital' },
        { id: 'googlepaystripe' },
        { id: 'googlepaystripeupe' },
        { id: 'googlepayworldpayaccess' },
        { id: 'googlepaytdonlinemart' },
        { id: 'googlepaystripeocs' },
        { id: 'googlepay_bigcommerce_payments' },
    ],
);
