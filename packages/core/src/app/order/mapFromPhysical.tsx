import { type DigitalItem, type PhysicalItem } from '@bigcommerce/checkout-sdk';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';
import { mapBackorderDetails } from './mapBackorderDetails';
import { type OrderItemType } from './OrderSummaryItem';

function mapFromPhysical(
    item: PhysicalItem,
    bundleItemsMap?: Map<string | number, Array<PhysicalItem | DigitalItem>>,
    pickListExperimentEnabled?: boolean,
): OrderItemType {
    const bundledItems = bundleItemsMap?.get(String(item.id));

    const bundledItemsAddedByAttributeIds = bundledItems?.flatMap(({ addedByAttributeId }) =>
        addedByAttributeId ? [addedByAttributeId] : [],
    );

    const options = pickListExperimentEnabled
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
                      content: pickListExperimentEnabled
                          ? `${option.name}: ${option.value}`
                          : `${option.name} ${option.value}`,
                      name: `${option.name}:`,
                      value: option.value,
                      isMainBundledItem: true,
                      stockPosition: bundledItem ? mapBackorderDetails(bundledItem) : undefined,
                  };
              }

              return {
                  testId: 'cart-item-product-option',
                  content: pickListExperimentEnabled
                      ? `${option.name}: ${option.value}`
                      : `${option.name} ${option.value}`,
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
        description: item.giftWrapping ? item.giftWrapping.name : undefined,
        productOptions: options,
        ...mapBackorderDetails(item),
    };
}

export default mapFromPhysical;
