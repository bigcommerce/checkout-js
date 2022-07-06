import { createMappableInjectHoc } from '../common/hoc';

import CheckoutContext, { CheckoutContextProps } from './CheckoutContext';

export type WithCheckoutProps = CheckoutContextProps;

const withCheckout = createMappableInjectHoc(CheckoutContext, { displayNamePrefix: 'WithCheckout' });

export default withCheckout;
