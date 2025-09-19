import type { CheckoutSelectors, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { compact, find } from 'lodash';

import { EMPTY_ARRAY } from '../../common/utility';
import { PaymentMethodId, PaymentMethodProviderType } from '../paymentMethod';

export const getDefaultPaymentMethodAndFilteredMethods = (
    checkoutState: CheckoutSelectors,
    paymentMethods?: PaymentMethod[],
): {
    defaultMethod?: PaymentMethod;
    methods: PaymentMethod[];
} => {
    if (!paymentMethods) {
        return {
            methods: EMPTY_ARRAY,
        }
    }

    const {
        data: {
            getCheckout,
            getConfig,
            getCustomer,
            getConsignments,
            getOrder,
            getPaymentMethod,
            getPaymentProviderCustomer,
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();
    const consignments = getConsignments();
    const paymentProviderCustomer = getPaymentProviderCustomer();

    const { isComplete = false } = getOrder() || {};
    let methods = paymentMethods;

    if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
        const stripeUpePaymentMethod = methods.filter(method =>
            method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE
        );

        methods = stripeUpePaymentMethod.length ? stripeUpePaymentMethod : methods;
    }

    if (!checkout || !config || !customer || isComplete) {
        throw new Error('checkout data is not available or order is complete');
    }

    const selectedPayment = find(checkout.payments, {
        providerType: PaymentMethodProviderType.Hosted,
    });

    let selectedPaymentMethod;
    let filteredMethods;

    filteredMethods = methods.filter((method: PaymentMethod) => {
        if (method.id === PaymentMethodId.Bolt && method.initializationData) {
            return Boolean(method.initializationData.showInCheckout);
        }

        return method.id !== PaymentMethodId.BraintreeLocalPaymentMethod;


    });

    if (consignments && consignments.length > 1) {
        const multiShippingIncompatibleMethodIds: string[] = [
            PaymentMethodId.AmazonPay,
        ];

        filteredMethods = methods.filter((method: PaymentMethod) => {
            return !multiShippingIncompatibleMethodIds.includes(method.id);
        });
    }

    if (selectedPayment) {
        selectedPaymentMethod = getPaymentMethod(
            selectedPayment.providerId,
            selectedPayment.gatewayId,
        );
        filteredMethods = selectedPaymentMethod
            ? compact([selectedPaymentMethod])
            : filteredMethods;
    } else {
        selectedPaymentMethod = find(filteredMethods, {
            config: { hasDefaultStoredInstrument: true },
        });
    }

    return {
        defaultMethod: selectedPaymentMethod || filteredMethods[0],
        methods: filteredMethods,
    };
}
