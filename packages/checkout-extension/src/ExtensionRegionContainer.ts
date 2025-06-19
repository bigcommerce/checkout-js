import { ExtensionRegion } from '@bigcommerce/checkout-sdk';

export enum ExtensionRegionContainer {
    ShippingShippingAddressFormBefore = 'extension-region-shipping-shippingaddressform-before',
    ShippingShippingAddressFormAfter = 'extension-region-shipping-shippingaddressform-after',
    ShippingSelectedShippingMethod = 'extension-region-shipping-selectedshippingmethod',
    PaymentPaymentMethodListBefore = 'extension-region-payment-paymentmethodlist-before',
    SummaryAfter = 'extension-region-summary-after',
    SummaryLastItemAfter = 'extension-region-summary-lastitem-after',
}

export const extensionRegionToContainerMap: Record<ExtensionRegion, ExtensionRegionContainer | ''> =
    {
        [ExtensionRegion.ShippingShippingAddressFormBefore]:
            ExtensionRegionContainer.ShippingShippingAddressFormBefore,
        [ExtensionRegion.ShippingShippingAddressFormAfter]:
            ExtensionRegionContainer.ShippingShippingAddressFormAfter,
        [ExtensionRegion.ShippingSelectedShippingMethod]:
            ExtensionRegionContainer.ShippingSelectedShippingMethod,
        [ExtensionRegion.PaymentPaymentMethodListBefore]:
            ExtensionRegionContainer.PaymentPaymentMethodListBefore,
        [ExtensionRegion.SummaryAfter]: ExtensionRegionContainer.SummaryAfter,
        [ExtensionRegion.SummaryLastItemAfter]: ExtensionRegionContainer.SummaryLastItemAfter,
        [ExtensionRegion.GlobalWebWorker]: '',
    };
