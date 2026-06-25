import { type DigitalItem, type PhysicalItem } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';
import { mapBackorderDetails } from './mapBackorderDetails';
import { type OrderItemType, type OrderSummaryItemOption } from './OrderSummaryItem';

function mapFromDigital(
    item: DigitalItem,
    bundleItemsMap?: Map<string | number, Array<PhysicalItem | DigitalItem>>,
    pickListExperimentEnabled?: boolean,
): OrderItemType {
    const bundledItems = bundleItemsMap?.get(String(item.id));
    const bundledItemsAddedByAttributeIds = bundledItems?.flatMap(({ addedByAttributeId }) =>
        addedByAttributeId ? [addedByAttributeId] : [],
    );

    const mappedOptions = pickListExperimentEnabled
        ? item.options?.map((option) => {
              if (
                  option.attributeId &&
                  bundledItemsAddedByAttributeIds?.includes(option.attributeId)
              ) {
                  const bundledItem = bundledItems?.find(
                      ({ addedByAttributeId }) => addedByAttributeId === option.attributeId,
                  );

                  return {
                      testId: 'cart-item-product-option',
                      content: `${option.name}: ${option.value}`,
                      name: `${option.name}:`,
                      value: option.value,
                      isMainBundledItem: true,
                      stockPosition: bundledItem ? mapBackorderDetails(bundledItem) : undefined,
                  };
              }

              return {
                  testId: 'cart-item-product-option',
                  content: `${option.name}: ${option.value}`,
                  name: `${option.name}:`,
                  value: option.value,
                  isMainBundledItem: false,
              };
          })
        : item.options?.map((option) => ({
              testId: 'cart-item-product-option',
              content: `${option.name} ${option.value}`,
              isMainBundledItem: false,
          }));

    return {
        id: item.id,
        quantity: item.quantity,
        amount: item.extendedComparisonPrice,
        amountAfterDiscount: item.extendedSalePrice,
        name: item.name,
        image: getOrderSummaryItemImage(item),
        productOptions: [...(mappedOptions || []), getDigitalItemDescription(item)],
        ...mapBackorderDetails(item),
    };
}

function getDigitalItemDescription(item: DigitalItem): OrderSummaryItemOption {
    if (!item.downloadPageUrl) {
        return {
            testId: 'cart-item-digital-product',
            content: <TranslatedString id="cart.digital_item_text" />,
        };
    }

    return {
        testId: 'cart-item-digital-product-download',
        content: (
            <a href={item.downloadPageUrl} rel="noopener noreferrer" target="_blank">
                <TranslatedString id="cart.downloads_action" />
            </a>
        ),
    };
}

export default mapFromDigital;
