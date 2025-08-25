import React, { type FunctionComponent } from 'react';

import {
    getUniquePaymentMethodId,
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PayPalCommercePaymentMethodComponent from '../components/PayPalCommercePaymentMethodComponent';

const PayPalCommerceAPMsPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { method, checkoutState } = props;
    const { isPaymentDataRequired } = checkoutState.data;
    const { id } = method;

    if (!isPaymentDataRequired()) {
        return null;
    }

    const widgetContainerId = getUniquePaymentMethodId(id, method.gateway);
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
            providerOptionsData={extraOptions}
            providerOptionsKey="paypalcommercealternativemethods"
            {...props}
        >
            <div className={`widget widget--${id} payment-widget`} id={widgetContainerId} />
        </PayPalCommercePaymentMethodComponent>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalCommerceAPMsPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods' }],
);
