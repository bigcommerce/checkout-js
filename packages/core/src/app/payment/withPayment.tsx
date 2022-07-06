import { createInjectHoc } from '../common/hoc';

import PaymentContext, { PaymentContextProps } from './PaymentContext';

export type WithPaymentProps = PaymentContextProps;

const withPayment = createInjectHoc(PaymentContext, { displayNamePrefix: 'WithPayment' });

export default withPayment;
