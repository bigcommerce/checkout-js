// import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
// import { noop } from 'lodash';
// import React, { FunctionComponent, useCallback, useContext } from 'react';
// import { Omit } from 'utility-types';

// import PaymentContext from '../PaymentContext';

// import HostedFieldPaymentMethod, {
//     HostedFieldPaymentMethodProps,
// } from './HostedFieldPaymentMethod';

// export type TDOnlineMartPaymentMethodProps = Omit<
//     HostedFieldPaymentMethodProps,
//     'cardCodeId' | 'cardExpiryId' | 'cardNumberId' | 'postalCodeId' | 'walletButtons'
// >;

// const TDOnlineMartPaymentMethod: FunctionComponent<TDOnlineMartPaymentMethodProps> = ({
//     initializePayment,
//     method,
//     onUnhandledError = noop,
//     ...rest
// }) => {
//     const paymentContext = useContext(PaymentContext);
//     const initializeTDOnlineMartPaymentMethod = useCallback(
//         (options: PaymentInitializeOptions) =>
//             initializePayment({
//                 ...options,
//             }),
//         [initializePayment],
//     );

//     return (
//             <HostedFieldPaymentMethod
//                 {...rest}
//                 cardCodeId="td-cvv"
//                 cardExpiryId="td-expiration-date"
//                 cardNumberId="td-card-number"
//                 initializePayment={initializeTDOnlineMartPaymentMethod}
//                 method={method}
//                 onUnhandledError={(e) => {
//                     onUnhandledError(e);
//                     paymentContext?.disableSubmit(method, true);
//                 }}
//             />
//     );
// };

// export default TDOnlineMartPaymentMethod;
