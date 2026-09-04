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
            const {
                checkoutService,
                checkoutState,
                isUsingMultiShipping = false,
                method,
                onUnhandledError,
            } = props;

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
                try {
                    await checkoutService.loadInstruments();
                } catch (error) {
                    const status = (error as { status?: number })?.status;
                    const is40x = typeof status === 'number' && status >= 400 && status < 500;

                    // For a 40x (e.g. an expired vault token) fall back silently to the credit card fields
                    if (!is40x && error instanceof Error) {
                        onUnhandledError(error);
                    }
                }
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
