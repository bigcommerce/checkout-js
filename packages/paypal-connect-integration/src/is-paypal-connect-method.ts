import isBraintreeConnectMethod from './is-braintree-connect-method';
import isPayPalCommerceConnectMethod from './is-paypal-commerce-connect-method';

const isPaypalConnectMethod = (methodId?: string): boolean => {
    return isBraintreeConnectMethod(methodId) || isPayPalCommerceConnectMethod(methodId);
};

export default isPaypalConnectMethod;
