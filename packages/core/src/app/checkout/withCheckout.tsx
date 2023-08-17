import { CheckoutContext, CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import { createMappableInjectHoc } from '@bigcommerce/checkout/legacy-hoc';


export type WithCheckoutProps = CheckoutContextProps;

const withCheckout = createMappableInjectHoc(CheckoutContext, {
    displayNamePrefix: 'WithCheckout',
});

export default withCheckout;
