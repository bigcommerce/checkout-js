import React, { type FunctionComponent } from 'react';

import {
    getUniquePaymentMethodId,
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import BigCommercePaymentsPaymentMethodComponent from '../components/BigCommercePaymentsPaymentMethodComponent';

const BigCommercePaymentsAPMsPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { method, checkoutState } = props;
    const isPaymentDataRequired = checkoutState.data.isPaymentDataRequired();

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
        <BigCommercePaymentsPaymentMethodComponent
            providerOptionsData={extraOptions}
            providerOptionsKey="bigcommerce_payments_apms"
            {...props}
        >
            <div className={`widget widget--${method.id} payment-widget`} id={widgetContainerId} />
        </BigCommercePaymentsPaymentMethodComponent>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BigCommercePaymentsAPMsPaymentMethod,
    [{ gateway: 'bigcommerce_payments_apms' }],
);
