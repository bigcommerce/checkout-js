import { createMappableInjectHoc } from '../common/hoc';

import CheckoutContext from './CheckoutContext';

const withCheckout = createMappableInjectHoc(CheckoutContext, { displayNamePrefix: 'WithCheckout' });

export default withCheckout;
