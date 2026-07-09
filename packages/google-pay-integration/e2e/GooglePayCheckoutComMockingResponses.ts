import {
    checkoutOrder as authorizeNetCheckoutOrder,
    googlePay as authorizeNetGooglePay,
    payment as authorizeNetPayment,
    internalOrder,
    order222,
    orderPayment,
} from './GooglePayMockingResponses';

export { internalOrder, order222, orderPayment };

export const payment = authorizeNetPayment
    .replace(/"id":"googlepayauthorizenet"/g, '"id":"googlepaycheckoutcom"')
    .replace(/"gateway":"authorizenet"/g, '"gateway":"checkoutcom"');

export const googlePay = authorizeNetGooglePay
    .replace(/"id":"googlepayauthorizenet"/g, '"id":"googlepaycheckoutcom"')
    .replace(/"gateway":"authorizenet"/g, '"gateway":"checkoutcom"');

export const checkoutOrder = authorizeNetCheckoutOrder.replace(
    '"providerId":"googlepayauthorizenet"',
    '"providerId":"googlepaycheckoutcom"',
);
