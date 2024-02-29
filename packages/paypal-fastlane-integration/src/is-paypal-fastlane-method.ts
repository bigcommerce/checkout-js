import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';
import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';

const isPaypalFastlaneMethod = (methodId?: string): boolean => {
    return isBraintreeFastlaneMethod(methodId) || isPayPalCommerceFastlaneMethod(methodId);
};

export default isPaypalFastlaneMethod;
