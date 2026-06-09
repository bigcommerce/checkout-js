# net-terms-payment-integration

Net Terms payment method UI for checkout-js.

Net Terms is an offline-style payment method (`id: 'net_terms'`, `type: 'PAYMENT_TYPE_OFFLINE'`)
delivered through `/api/storefront/payments`. When selected in the payment accordion it renders a
**required PO Number** input. The shopper cannot submit the order until a PO Number is provided
(enforced by a yup validation schema registered with the payment form).

On submit, the PO Number is collected into `payment.paymentData.poNumber` and forwarded to the
backend by the `createNetTermsPaymentStrategy` strategy from
`@bigcommerce/checkout-sdk/integrations/net-terms`. There is no separate payment call; a successful
submit order advances the shopper to the order confirmation page.
