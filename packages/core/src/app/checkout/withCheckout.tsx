import { createMappableInjectHoc } from '@bigcommerce/checkout/legacy-hoc';
import { CheckoutContext, CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

export type WithCheckoutProps = CheckoutContextProps;

const withCheckout = createMappableInjectHoc(CheckoutContext, {
    displayNamePrefix: 'WithCheckout',
});

export default withCheckout;
