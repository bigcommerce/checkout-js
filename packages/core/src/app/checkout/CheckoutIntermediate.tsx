import {
    type CheckoutInitialState,
    type EmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessengerOptions
} from '@bigcommerce/checkout-sdk';
import React from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { CheckoutPageSkeleton } from '@bigcommerce/checkout/ui';

import { type EmbeddedCheckoutStylesheet } from '../embeddedCheckout';

import CheckoutPage from './CheckoutPage';
import type CheckoutSupport from './CheckoutSupport';
import { useLoadCheckout } from './hooks';

export interface CheckoutIntermediateProps {
    checkoutId: string;
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    embeddedSupport: CheckoutSupport;
    errorLogger: ErrorLogger;
    initialState?: CheckoutInitialState;
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
}

const CheckoutIntermediate:React.FC<CheckoutIntermediateProps>= (props) => {
    const { checkoutId, initialState } = props;
    const { isLoadingCheckout } = useLoadCheckout(checkoutId, initialState);
    const { themeV2 } = useThemeContext();

    if (isLoadingCheckout) {
        return <CheckoutPageSkeleton />;
    }

    return <CheckoutPage
            {...props}
            createEmbeddedMessenger={props.createEmbeddedMessenger}
            embeddedStylesheet={props.embeddedStylesheet}
            embeddedSupport={props.embeddedSupport}
            errorLogger={props.errorLogger}
            themeV2={themeV2}
        />;
};

export default CheckoutIntermediate;
