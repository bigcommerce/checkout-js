import { CheckoutContext, type CheckoutContextProps } from '@bigcommerce/checkout/contexts';
import { createMappableInjectHoc } from '@bigcommerce/checkout/legacy-hoc';

export type WithCheckoutProps = CheckoutContextProps;

const withCheckout = createMappableInjectHoc(CheckoutContext, {
    displayNamePrefix: 'WithCheckout',
});

export default withCheckout;
