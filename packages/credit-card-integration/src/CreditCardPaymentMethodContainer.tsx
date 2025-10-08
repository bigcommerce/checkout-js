import React, { type ReactNode, useEffect, useState } from 'react';

import { isInstrumentFeatureAvailable } from '@bigcommerce/checkout/instrument-utils';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import {
    CreditCardPaymentMethodComponent,
    type CreditCardPaymentMethodProps,
} from './CreditCardPaymentMethodComponent';

export const CreditCardPaymentMethodComponentContainer = (
    props: CreditCardPaymentMethodProps & PaymentMethodProps,
): ReactNode => {
    const [componentDidMount, setComponentDidMount] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { checkoutService, checkoutState, isUsingMultiShipping = false, method } = props;

            const {
                data: { getConfig, getCustomer },
            } = checkoutState;

            const config = getConfig();
            const customer = getCustomer();

            if (!config || !customer || !method) {
                throw new Error('Unable to get checkout');
            }

            const isInstrumentFeatureAvailableFlag = isInstrumentFeatureAvailable({
                config,
                customer,
                isUsingMultiShipping,
                paymentMethod: method,
            });

            if (isInstrumentFeatureAvailableFlag) {
                await checkoutService.loadInstruments();
            }

            setComponentDidMount(true);
        };

        void init();
    }, []);

    if (!componentDidMount) {
        return null;
    }

    return <CreditCardPaymentMethodComponent {...props} />;
};

export default CreditCardPaymentMethodComponentContainer;
