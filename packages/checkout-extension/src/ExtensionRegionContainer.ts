import { ExtensionRegion } from '@bigcommerce/checkout-sdk';

export enum ExtensionRegionContainer {
    ShippingShippingAddressFormBefore = 'extension-region-shipping-shippingaddressform-before',
    ShippingShippingAddressFormAfter = 'extension-region-shipping-shippingaddressform-after',
    ShippingSelectedShippingMethod = 'extension-region-shipping-selectedshippingmethod',
    SummaryAfter = 'extension-region-summary-after',
    SummaryLastItemAfter = 'extension-region-summary-lastitem-after',
}

export const extensionRegionToContainerMap: Record<ExtensionRegion, ExtensionRegionContainer> = {
    [ExtensionRegion.ShippingShippingAddressFormBefore]:
        ExtensionRegionContainer.ShippingShippingAddressFormBefore,
    [ExtensionRegion.ShippingShippingAddressFormAfter]:
        ExtensionRegionContainer.ShippingShippingAddressFormAfter,
    [ExtensionRegion.ShippingSelectedShippingMethod]:
        ExtensionRegionContainer.ShippingSelectedShippingMethod,
    [ExtensionRegion.SummaryAfter]: ExtensionRegionContainer.SummaryAfter,
    [ExtensionRegion.SummaryLastItemAfter]: ExtensionRegionContainer.SummaryLastItemAfter,
};
