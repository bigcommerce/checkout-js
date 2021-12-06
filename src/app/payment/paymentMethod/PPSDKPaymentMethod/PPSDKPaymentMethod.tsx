import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { PaymentMethodProps, WithCheckoutPaymentMethodProps } from '../PaymentMethod';

import { initializationComponentMap } from './initializationComponentMap';

type Props = PaymentMethodProps & WithCheckoutPaymentMethodProps;

export const PPSDKPaymentMethod: FunctionComponent<Props> = props => {
    const { method, onUnhandledError = noop } = props;

    const componentKey = method?.initializationStrategy?.type || '';
    const Component = initializationComponentMap[componentKey];

    if (!Component) {
        onUnhandledError(new Error('PPSDK initialization strategy not found'));

        return null;
    }

    return <Component { ...props } />;
};
