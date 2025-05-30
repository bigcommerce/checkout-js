import { createLanguageService, DigitalItem, PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';

import { type LocaleContextType } from '@bigcommerce/checkout/locale';

export default function getOrderSummaryItemImage(item: DigitalItem | PhysicalItem): ReactNode {
    if (!item.imageUrl) {
        return;
    }

    // Get the language service to translate the alt text
    const localeContext: LocaleContextType = { language: createLanguageService() };
    // Use the language service to get a translated string for the alt attribute
    const altText = localeContext.language.translate('cart.product_image_alt', { name: item.name });

    return <img 
        alt={altText}
        data-test="cart-item-image" 
        src={item.imageUrl} 
    />;
}
