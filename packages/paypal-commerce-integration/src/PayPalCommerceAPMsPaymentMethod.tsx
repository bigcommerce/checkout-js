import React, { FunctionComponent } from 'react';

import {
    getUniquePaymentMethodId,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from './components/PayPalCommercePaymentMethodComponent';

const PayPalCommerceAPMsPaymentMethod: FunctionComponent<PaymentMethodProps> = props => {
    const { method } = props;
    const isPaymentDataRequired = props.checkoutState.data.isPaymentDataRequired();

    if (!isPaymentDataRequired) {
        return null;
    }


    const widgetContainerId = getUniquePaymentMethodId(method.id, method.gateway);
    const extraOptions = {
        apmFieldsContainer: `#${widgetContainerId}`,
        apmFieldsStyles: {
            variables: {
                fontFamily: 'Open Sans, Helvetica Neue, Arial, sans-serif',
                colorBackground: 'transparent',
                textColor: 'black',
                fontSizeBase: '16px',
                spacingUnit: '1rem',
                borderColor: '#d9d9d9',
                borderRadius: '4px',
                borderWidth: '1px',
            },
            rules: {
                '.Input': {
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '1rem',
                },
                '.Input:active': {
                    color: '#4496f6',
                },
                '.Input--invalid': {
                    color: '#ed6a6a',
                },
            },
        },
    };

    return (
        <PayPalCommercePaymentMethodComponent
            providerOptionsKey="paypalcommercealternativemethods"
            providerOptionsData={extraOptions}
            {...props}
        >

            <div
                className={`widget widget--${props.method.id} payment-widget`}
                id={widgetContainerId}
            ></div>
        </PayPalCommercePaymentMethodComponent>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceAPMsPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods' }],
);
