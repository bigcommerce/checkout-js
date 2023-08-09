import React, { FunctionComponent } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const BraintreeAcceleratedCheckoutPaymentMethod: FunctionComponent<PaymentMethodProps> = () => {
    return (
        <div>
            <div id="braintree-axo-cc-form-container" data-test="braintree-axo-cc-form-container" />
        </div>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeAcceleratedCheckoutPaymentMethod,
    [{ id: 'braintreeacceleratedcheckout' }],
);
