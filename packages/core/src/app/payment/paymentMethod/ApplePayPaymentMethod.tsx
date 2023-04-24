import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/locale';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

const ApplePayPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const localeContext = useContext(LocaleContext);

    const initializeApplePay = useCallback(
        (options: PaymentInitializeOptions) =>
            initializePayment({
                ...options,
                applepay: {
                    shippingLabel: localeContext?.language.translate('cart.shipping_text'),
                    subtotalLabel: localeContext?.language.translate('cart.subtotal_text'),
                },
            }),
        [initializePayment, localeContext],
    );

    return <HostedPaymentMethod {...rest} initializePayment={initializeApplePay} method={method} />;
};

export default ApplePayPaymentMethod;
