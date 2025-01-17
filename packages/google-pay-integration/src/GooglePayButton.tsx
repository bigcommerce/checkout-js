import React, { FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import './GooglePayButton.scss';

const GooglePayButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    return <CheckoutButton checkoutButtonContainerClass="google-pay-top-button" {...props} />;
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
    ],
);
