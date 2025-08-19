import { createInjectHoc } from '@bigcommerce/checkout/legacy-hoc';

import PaymentContext, { type PaymentContextProps } from './PaymentContext';

export type WithPaymentProps = PaymentContextProps;

const withPayment = createInjectHoc(PaymentContext, { displayNamePrefix: 'WithPayment' });

export default withPayment;
