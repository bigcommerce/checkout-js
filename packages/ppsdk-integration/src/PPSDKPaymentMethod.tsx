import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { initializationComponentMap } from './initializationComponentMap';

const PPSDKPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const { method, onUnhandledError = noop } = props;

    const componentKey = method.initializationStrategy?.type || '';
    const Component = initializationComponentMap[componentKey];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!Component) {
        onUnhandledError(new Error('PPSDK initialization strategy not found'));

        return null;
    }

    return <Component {...props} />;
};

export default toResolvableComponent(PPSDKPaymentMethod, [
    {
        type: 'PAYMENT_TYPE_SDK',
    },
]);
