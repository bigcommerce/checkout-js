import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { CheckoutContextProps, withCheckout } from '../../checkout';
import { getAppliedStyles } from '../../common/dom';
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
}

const StripeUPEPaymentMethod: FunctionComponent<
    StripePaymentMethodProps &
        WithInjectedHostedCreditCardFieldsetProps &
        WithCheckoutStripePaymentMethodProps
> = ({ initializePayment, method, storeUrl, onUnhandledError = noop, ...rest }) => {
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

    return (
        <>
            <HostedWidgetPaymentMethod
                {...rest}
                containerId={containerId}
                hideContentWhenSignedOut
                initializePayment={initializeStripePayment}
                method={method}
            />
            {renderCheckoutThemeStylesForStripeUPE()}
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

export default withHostedCreditCardFieldset(
    withCheckout(mapFromCheckoutProps)(StripeUPEPaymentMethod),
);
