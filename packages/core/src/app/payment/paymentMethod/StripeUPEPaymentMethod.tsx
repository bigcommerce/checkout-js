import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import {
    withHostedCreditCardFieldset,
    WithInjectedHostedCreditCardFieldsetProps,
} from '../hostedCreditCard';
import PaymentContext from '../PaymentContext';

import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';

export type StripePaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

interface WithCheckoutStripePaymentMethodProps {
    storeUrl: string;
    isGuest: boolean;
    isStripeLinkAuthenticated: boolean;
}

const StripeUPEPaymentMethod: FunctionComponent<
    StripePaymentMethodProps &
        WithInjectedHostedCreditCardFieldsetProps &
        WithCheckoutStripePaymentMethodProps
> = ({ initializePayment, method, storeUrl, isGuest, isStripeLinkAuthenticated,  onUnhandledError = noop, ...rest }) => {
    const containerId = `stripe-${method.id}-component-field`;

    const paymentContext = useContext(PaymentContext);

    const renderSubmitButton = () => {
        paymentContext?.hidePaymentSubmitButton(method, false);
    }

    const initializeStripePayment: HostedWidgetPaymentMethodProps['initializePayment'] =
        useCallback(
            async (options: PaymentInitializeOptions) => {
                const formInput = getStylesFromElement(`${containerId}--input`, [
                    'color',
                    'background-color',
                    'border-color',
                    'box-shadow',
                ]);
                const formLabel = getStylesFromElement(`${containerId}--label`, ['color']);
                const formError = getStylesFromElement(`${containerId}--error`, ['color']);

                paymentContext?.hidePaymentSubmitButton(method, true);

                return initializePayment({
                    ...options,
                    stripeupe: {
                        containerId,
                        style: {
                            labelText: formLabel.color,
                            fieldText: formInput.color,
                            fieldPlaceholderText: formInput.color,
                            fieldErrorText: formError.color,
                            fieldBackground: formInput['background-color'],
                            fieldInnerShadow: formInput['box-shadow'],
                            fieldBorder: formInput['border-color'],
                        },
                        onError: onUnhandledError,
                        render: renderSubmitButton,
                    },
                });
            },
            [initializePayment, containerId, onUnhandledError],
        );

    const getStylesFromElement = (id: string, properties: string[]) => {
        const parentContainer = document.getElementById(id);

        if (!parentContainer) {
            throw new Error(
                'Unable to retrieve input styles as the provided container ID is not valid.',
            );
        }

        return getAppliedStyles(parentContainer, properties);
    };

    const renderCheckoutThemeStylesForStripeUPE = () => {
        return (
            <div
                className="optimizedCheckout-form-input"
                id={`${containerId}--input`}
                placeholder="1111"
            >
                <div className="form-field--error">
                    <div className="optimizedCheckout-form-label" id={`${containerId}--error`} />
                </div>
                <div className="optimizedCheckout-form-label" id={`${containerId}--label`} />
            </div>
        );
    };

    const shouldSavingCardsBeEnabled = (): boolean => {
        if (!isGuest && isStripeLinkAuthenticated) {
            return false;
        } 

        return true;
    }

    return (
        <>
            <HostedWidgetPaymentMethod
                {...rest}
                containerId={containerId}
                hideContentWhenSignedOut
                initializePayment={initializeStripePayment}
                method={method}
                shouldSavingCardsBeEnabled={shouldSavingCardsBeEnabled()}
            />
            {renderCheckoutThemeStylesForStripeUPE()}
        </>
    );
};

function mapFromCheckoutProps({ checkoutState }: CheckoutContextProps ) {
    const {
        data: { getConfig, getCustomer, getPaymentProviderCustomer },
    } = checkoutState;
    const config = getConfig();
    const customer = getCustomer();
    const paymentProviderCustomer = getPaymentProviderCustomer();

    if (!config || !customer) {
        return null;
    }

    const isStripeLinkAuthenticated = paymentProviderCustomer?.stripeLinkAuthenticationState;

    return {
        storeUrl: config.links.siteLink,
        isGuest: customer.isGuest,
        isStripeLinkAuthenticated,
    };
}

export default withHostedCreditCardFieldset(
    withCheckout(mapFromCheckoutProps)(StripeUPEPaymentMethod),
);
