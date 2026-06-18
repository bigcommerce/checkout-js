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
        ? item.options?.filter(
              (option) =>
                  option.attributeId &&
                  !bundledItemsAddedByAttributeIds?.includes(option.attributeId),
          )
        : item.options;

    return {
        id: item.id,
        quantity: item.quantity,
        amount: item.extendedComparisonPrice,
        amountAfterDiscount: item.extendedSalePrice,
        name: item.name,
        image: getOrderSummaryItemImage(item),
        description: item.giftWrapping ? item.giftWrapping.name : undefined,
        productOptions: (options || []).map((option) => ({
            testId: 'cart-item-product-option',
            content: pickListExperimentEnabled
                ? `${option.name}: ${option.value}`
                : `${option.name} ${option.value}`,
        })),
        bundledItems: pickListExperimentEnabled
            ? bundledItems?.map((bundledItem) => ({
                  name: bundledItem.name,
                  id: String(bundledItem.id),
                  bundleLabel: item.options?.find(
                      (option) => option.attributeId === bundledItem.addedByAttributeId,
                  )?.name,
                  ...mapBackorderDetails(bundledItem),
              }))
            : undefined,
        ...mapBackorderDetails(item),
    };
}

export default mapFromPhysical;
