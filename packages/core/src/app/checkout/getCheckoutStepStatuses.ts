import { type CheckoutPayment, type CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import { compact } from 'lodash';
import { createSelector } from 'reselect';

import { shouldUseStripeLinkByMinimumAmount } from '@bigcommerce/checkout/instrument-utils';

import { isValidAddress } from '../address';
import { EMPTY_ARRAY, isExperimentEnabled } from '../common/utility';
import { SUPPORTED_METHODS } from '../customer';
import { PaymentMethodId } from '../payment/paymentMethod';
import {
    hasSelectedShippingOptions,
    hasUnassignedLineItems,
    itemsRequireShipping,
} from '../shipping';

import CheckoutStepType from './CheckoutStepType';

// StripeLink is a UX that is only available with StripeUpe and will only be displayed for BC guest users,
// it uses its own components in the customer and shipping steps, unfortunately in order to preserve the UX
// when reloading the checkout page it's necessary to refill the stripe components with the information saved.
// In this step, we require that the customer strategy be reloaded the first time.
const getStripeLinkAndCheckoutPageIsReloaded = (
    isUsingWallet: boolean,
    hasEmail: boolean,
    isGuest: boolean,
    shouldUseStripeLinkByMinimumAmount: boolean,
    providerWithCustomCheckout?: string | null,
) => {
    return !isUsingWallet && providerWithCustomCheckout === PaymentMethodId.StripeUPE && hasEmail && isGuest && shouldUseStripeLinkByMinimumAmount;
}

const getCustomerStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getCheckout(),
    ({ data }: CheckoutSelectors) => data.getCustomer(),
    ({ data }: CheckoutSelectors) => data.getBillingAddress(),
    ({ data }: CheckoutSelectors) => data.getConfig(),
    ({ data }: CheckoutSelectors) => data.getCart(),
    ({ data }: CheckoutSelectors) => data.getPaymentProviderCustomer(),
    (checkout, customer, billingAddress, config, cart, paymentProviderCustomer) => {
        const hasEmail = !!(
            (customer && customer.email) ||
            (billingAddress && billingAddress.email)
        );
        const isUsingWallet =
            checkout && checkout.payments
                ? checkout.payments.some(
                    (payment: CheckoutPayment) => SUPPORTED_METHODS.includes(payment.providerId),
                  )
                : false;
        const isGuest = !!(customer && customer.isGuest);
        const isComplete = hasEmail || isUsingWallet;
        const isEditable = isComplete && !isUsingWallet && isGuest;
        const isUsingStripeLinkAndCheckoutPageIsReloaded = getStripeLinkAndCheckoutPageIsReloaded(
            isUsingWallet,
            hasEmail,
            isGuest,
            cart ? shouldUseStripeLinkByMinimumAmount(cart) : false,
            config?.checkoutSettings.providerWithCustomCheckout,
        );

        if (isUsingStripeLinkAndCheckoutPageIsReloaded) {
            return {
                type: CheckoutStepType.Customer,
                isActive: false,
                isComplete: paymentProviderCustomer?.stripeLinkAuthenticationState !== undefined,
                isEditable,
                isRequired: true,
            };
        }

        return {
            type: CheckoutStepType.Customer,
            isActive: false,
            isComplete,
            isEditable,
            isRequired: true,
        };
    },
);

const getBillingStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getCheckout(),
    ({ data }: CheckoutSelectors) => data.getBillingAddress(),
    ({ data }: CheckoutSelectors) => {
        const billingAddress = data.getBillingAddress();

        return billingAddress
            ? data.getBillingAddressFields(billingAddress.countryCode)
            : EMPTY_ARRAY;
    },
    ({ data }: CheckoutSelectors) => data.getConfig(),
    (checkout, billingAddress, billingAddressFields) => {
        const hasAddress = billingAddress
            ? isValidAddress(billingAddress, billingAddressFields)
            : false;
        const isUsingWallet =
            checkout && checkout.payments
                ? checkout.payments.some(
                      (payment) => SUPPORTED_METHODS.includes(payment.providerId),
                  )
                : false;
        const isComplete = hasAddress || isUsingWallet;
        const isUsingAmazonPay =
            checkout && checkout.payments
                ? checkout.payments.some((payment) => payment.providerId === 'amazonpay')
                : false;

        if (isUsingAmazonPay) {
            const billingAddressCustomFields = billingAddressFields.filter(
                ({ custom }: { custom: boolean }) => custom,
            );
            const hasCustomFields = billingAddressCustomFields.length > 0;
            const isAmazonPayBillingStepComplete =
                billingAddress && hasCustomFields
                    ? isValidAddress(billingAddress, billingAddressCustomFields)
                    : true;

            return {
                type: CheckoutStepType.Billing,
                isActive: false,
                isComplete: isAmazonPayBillingStepComplete,
                isEditable: isAmazonPayBillingStepComplete && hasCustomFields,
                isRequired: true,
            };
        }

        const isUsingGooglePay = (checkout && checkout.payments
                ? checkout.payments.some((payment) => (payment?.providerId || '').startsWith('googlepay'))
                : false);

        if (isUsingGooglePay) {
            return {
                type: CheckoutStepType.Billing,
                isActive: false,
                isComplete: hasAddress,
                isEditable: hasAddress,
                isRequired: true,
            };
        }

        const isUsingPaypal =
            checkout && checkout.payments
                ? checkout.payments.some(
                    (payment) =>
                        [
                            'braintreepaypal',
                            'braintreepaypalcredit',
                            'braintreevenmo',
                            'paypalcommerce',
                            'paypalcommercecredit',
                            'paypalcommercevenmo'
                        ]
                            .includes(payment.providerId))
                : false;

        if (isUsingPaypal) {
            return {
                type: CheckoutStepType.Billing,
                isActive: false,
                isComplete: hasAddress,
                isEditable: hasAddress,
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
    },
);

const getShippingStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getShippingAddress(),
    ({ data }: CheckoutSelectors) => data.getConsignments(),
    ({ data }: CheckoutSelectors) => data.getCart(),
    ({ data }: CheckoutSelectors) => {
        const shippingAddress = data.getShippingAddress();

        return shippingAddress
            ? data.getShippingAddressFields(shippingAddress.countryCode)
            : EMPTY_ARRAY;
    },
    ({ data }: CheckoutSelectors) => data.getConfig(),
    (shippingAddress, consignments, cart, shippingAddressFields, config) => {
        const validateMaxLength =
            isExperimentEnabled(
                config?.checkoutSettings,
                'CHECKOUT-9768.form_fields_max_length_validation',
                false
            );
        const hasAddress = shippingAddress
            ? isValidAddress(shippingAddress, shippingAddressFields, validateMaxLength)
            : false;
        const hasOptions = consignments ? hasSelectedShippingOptions(consignments) : false;
        const hasUnassignedItems =
            cart && consignments ? hasUnassignedLineItems(consignments, cart.lineItems) : true;
        const isComplete = hasAddress && hasOptions && !hasUnassignedItems;
        const isRequired = itemsRequireShipping(cart, config);
        const isCustomShippingSelected =
            isExperimentEnabled(
                config?.checkoutSettings,
                'PROJECT-5015.manual_order.display_custom_shipping',
            ) &&
            hasOptions &&
            consignments?.some(
                ({ selectedShippingOption }) => selectedShippingOption?.type === 'custom',
            );

        return {
            type: CheckoutStepType.Shipping,
            isActive: false,
            isComplete,
            isEditable: isComplete && isRequired && !isCustomShippingSelected,
            isRequired,
        };
    },
);

const getPaymentStepStatus = createSelector(
    ({ data }: CheckoutSelectors) => data.getOrder(),
    (order) => {
        const isComplete = order ? order.isComplete : false;

        return {
            type: CheckoutStepType.Payment,
            isActive: false,
            isComplete,
            isEditable: isComplete,
            isRequired: true,
        };
    },
);

const getOrderSubmitStatus = createSelector(
    ({ statuses }: CheckoutSelectors) => statuses.isSubmittingOrder(),
    (status) => status,
);

const getCheckoutStepStatuses = createSelector(
    getCustomerStepStatus,
    getShippingStepStatus,
    getBillingStepStatus,
    getPaymentStepStatus,
    getOrderSubmitStatus,
    (customerStep, shippingStep, billingStep, paymentStep, orderStatus) => {
        const isSubmittingOrder = orderStatus;

        const steps = compact([customerStep, shippingStep, billingStep, paymentStep]);

        const defaultActiveStep =
            steps.find((step) => !step.isComplete && step.isRequired) || steps[steps.length - 1];

        return steps.map((step, index) => {
            const isPrevStepComplete = steps
                .slice(0, index)
                .every((prevStep) => prevStep.isComplete || !prevStep.isRequired);

            return {
                ...step,
                isActive: defaultActiveStep.type === step.type,
                isBusy: false,
                // A step is only editable if its previous step is complete or not required
                isEditable: isPrevStepComplete && step.isEditable && !isSubmittingOrder,
            };
        });
    },
);

export default getCheckoutStepStatuses;
