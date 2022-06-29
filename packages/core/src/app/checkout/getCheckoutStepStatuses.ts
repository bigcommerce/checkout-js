import { CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { compact } from 'lodash';
import { createSelector } from 'reselect';

import { isValidAddress } from '../address';
import { EMPTY_ARRAY } from '../common/utility';
import { SUPPORTED_METHODS } from '../customer';
import { hasSelectedShippingOptions, hasUnassignedLineItems, itemsRequireShipping } from '../shipping';

import CheckoutStepType from './CheckoutStepType';

const getCustomerStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getCheckout(),
    ({ data }: CheckoutSelectors) => data.getCustomer(),
    ({ data }: CheckoutSelectors) => data.getBillingAddress(),
    (checkout, customer, billingAddress) => {
        const hasEmail = !!(customer && customer.email || billingAddress && billingAddress.email);
        const isUsingWallet = checkout && checkout.payments ? checkout.payments.some(payment => SUPPORTED_METHODS.indexOf(payment.providerId) >= 0) : false;
        const isGuest = !!(customer && customer.isGuest);
        const isComplete = hasEmail || isUsingWallet;

        return {
            type: CheckoutStepType.Customer,
            isActive: false,
            isComplete,
            isEditable: isComplete && !isUsingWallet && isGuest,
            isRequired: true,
        };
    }
);

const getBillingStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getCheckout(),
    ({ data }: CheckoutSelectors) => data.getBillingAddress(),
    ({ data }: CheckoutSelectors) => {
        const billingAddress = data.getBillingAddress();

        return billingAddress ? data.getBillingAddressFields(billingAddress.countryCode) : EMPTY_ARRAY;
    },
    (checkout, billingAddress, billingAddressFields) => {
        const hasAddress = billingAddress ? isValidAddress(billingAddress, billingAddressFields) : false;
        const isUsingWallet = checkout && checkout.payments ? checkout.payments.some(payment => SUPPORTED_METHODS.indexOf(payment.providerId) >= 0) : false;
        const isComplete = hasAddress || isUsingWallet;
        const isUsingAmazonPay = checkout && checkout.payments ? checkout.payments.some(payment => payment.providerId === 'amazonpay') : false;

        if (isUsingAmazonPay) {
            const billingAddressCustomFields = billingAddressFields.filter(({ custom }: { custom: boolean }) => custom);
            const hasCustomFields = billingAddressCustomFields.length > 0;
            const isAmazonPayBillingStepComplete = billingAddress && hasCustomFields ? isValidAddress(billingAddress, billingAddressCustomFields) : true;

            return {
                type: CheckoutStepType.Billing,
                isActive: false,
                isComplete: isAmazonPayBillingStepComplete,
                isEditable: isAmazonPayBillingStepComplete && hasCustomFields,
                isRequired: true,
            };
        }

        return {
            type: CheckoutStepType.Billing,
            isActive: false,
            isComplete,
            isEditable: isComplete && !isUsingWallet,
            isRequired: true,
        };
    }
);

const getShippingStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getShippingAddress(),
    ({ data }: CheckoutSelectors) => data.getConsignments(),
    ({ data }: CheckoutSelectors) => data.getCart(),
    ({ data }: CheckoutSelectors) => data.getSelectedPaymentMethod(),
    ({ data }: CheckoutSelectors) => {
        const shippingAddress = data.getShippingAddress();

        return shippingAddress ? data.getShippingAddressFields(shippingAddress.countryCode) : EMPTY_ARRAY;
    },
    ({ data }: CheckoutSelectors) => data.getConfig(),
    (shippingAddress, consignments, cart, payment, shippingAddressFields, config) => {
        const hasAddress = shippingAddress ? isValidAddress(shippingAddress, shippingAddressFields) : false;
        // @todo: interim solution, ideally we should render custom form fields below amazon shipping widget
        const hasRemoteAddress = !!shippingAddress && !!payment && payment.id === 'amazon';
        const hasOptions = consignments ? hasSelectedShippingOptions(consignments) : false;
        const hasUnassignedItems = cart && consignments ? hasUnassignedLineItems(consignments, cart.lineItems) : true;
        const isComplete = (hasAddress || hasRemoteAddress) && hasOptions && !hasUnassignedItems;
        const isRequired = itemsRequireShipping(cart, config);

        return {
            type: CheckoutStepType.Shipping,
            isActive: false,
            isComplete,
            isEditable: isComplete && isRequired,
            isRequired,
        };
    }
);

const getPaymentStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getOrder(),
    order => {
        const isComplete = order ? order.isComplete : false;

        return {
            type: CheckoutStepType.Payment,
            isActive: false,
            isComplete,
            isEditable: isComplete,
            isRequired: true,
        };
    }
);

const getCheckoutStepStatuses = createSelector(
    getCustomerStepStatus,
    getShippingStepStatus,
    getBillingStepStatus,
    getPaymentStepStatus,
    (customerStep, shippingStep, billingStep, paymentStep) => {
        const steps = compact([
            customerStep,
            shippingStep,
            billingStep,
            paymentStep,
        ]);

        const defaultActiveStep = steps.find(step => !step.isComplete && step.isRequired) || steps[steps.length - 1];

        return steps.map((step, index) => {
            const isPrevStepComplete = steps.slice(0, index).every(prevStep => prevStep.isComplete || !prevStep.isRequired);

            return {
                ...step,
                isActive: defaultActiveStep.type === step.type,
                // A step is only editable if its previous step is complete or not required
                isEditable: isPrevStepComplete && step.isEditable,
            };
        });
    }
);

export default getCheckoutStepStatuses;
