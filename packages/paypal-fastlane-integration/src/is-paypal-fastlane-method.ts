import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';
import isBigCommercePaymentsFastlaneMethod from './is-bigcommerce-payments-fastlane-method';

const isPaypalFastlaneMethod = (methodId?: string): boolean => {
    return isBraintreeFastlaneMethod(methodId) || isPayPalCommerceFastlaneMethod(methodId) || isBigCommercePaymentsFastlaneMethod(methodId);
};

export default isPaypalFastlaneMethod;
