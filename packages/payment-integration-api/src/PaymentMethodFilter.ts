import {
    type Capabilities,
    type Checkout,
    type CheckoutSettings,
    type PaymentMethod,
    type PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';

export interface PaymentMethodFilterContext {
    capabilities: Capabilities;
    checkout: Checkout;
    checkoutSettings: CheckoutSettings;
    getPaymentMethod: (methodId: string, gatewayId?: string) => PaymentMethod | undefined;
    paymentProviderCustomer?: PaymentProviderCustomer;
}

export interface PaymentMethodFilter {
    name: string;
    apply(methods: PaymentMethod[], context: PaymentMethodFilterContext): PaymentMethod[];
}
