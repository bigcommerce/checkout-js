import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

enum GooglePayPaymentMethodId {
    AdyenV2GooglePay = PaymentMethodId.AdyenV2GooglePay,
    AdyenV3GooglePay = PaymentMethodId.AdyenV3GooglePay,
    AuthorizeNetGooglePay = PaymentMethodId.AuthorizeNetGooglePay,
    BNZGooglePay = PaymentMethodId.BNZGooglePay,
    BraintreeGooglePay = PaymentMethodId.BraintreeGooglePay,
    PayPalCommerceGooglePay = PaymentMethodId.PayPalCommerceGooglePay,
    CheckoutcomGooglePay = PaymentMethodId.CheckoutcomGooglePay,
    CybersourceV2GooglePay = PaymentMethodId.CybersourceV2GooglePay,
    OrbitalGooglePay = PaymentMethodId.OrbitalGooglePay,
    StripeGooglePay = PaymentMethodId.StripeGooglePay,
    StripeUPEGooglePay = PaymentMethodId.StripeUPEGooglePay,
    WorldpayAccessGooglePay = PaymentMethodId.WorldpayAccessGooglePay,
    TdOnlineMartGooglePay = PaymentMethodId.TdOnlineMartGooglePay,
}

export default GooglePayPaymentMethodId;
