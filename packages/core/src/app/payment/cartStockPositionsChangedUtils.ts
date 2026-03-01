import { type Cart, type Consignment, type PhysicalItem } from '@bigcommerce/checkout-sdk';
import { compact, uniqBy } from 'lodash';

import findLineItems from '../shipping/findLineItems';

import type { CartStockPositionsChangedConsignmentGroup } from './CartStockPositionsChangedMultiConsignmentContent';

/**
 * Resolve changed line item IDs to cart items; for bundled items use parent item (we do not show bundled item separately), then dedupe.
 */
export function getChangedItemsToShow(
  cart?: Cart,
  changedLineItemIds?: Array<string | number>,
): PhysicalItem[] {
  const allCartPhysicalItems = cart?.lineItems?.physicalItems ?? [];

  if (
    !allCartPhysicalItems.length ||
    !Array.isArray(changedLineItemIds) ||
    !changedLineItemIds.length
  ) {
    return [];
  }

  const allCartPhysicalItemsById = new Map(allCartPhysicalItems.map((it) => [it.id, it]));

  return uniqBy(
    compact(
      changedLineItemIds.map((id) => {
        const item = allCartPhysicalItemsById.get(id);

        if (!item) return undefined;

        return item.parentId != null ? (allCartPhysicalItemsById.get(item.parentId) ?? item) : item;
      }),
    ),
    'id',
  );
}

/**
 * Group changed items by consignment. Displayed destination numbers match the original consignment order
 * (e.g. Destination 1 and Destination 3 when destination 2 has no changed items).
 * Returns null when there is at most one consignment or no groups with changed items.
 */
export function groupChangedItemsByConsignment(
    cart: Cart | undefined,
    consignments: Consignment[] | undefined,
    changedItemsToShow: PhysicalItem[],
): CartStockPositionsChangedConsignmentGroup[] | null {
    if (!cart || !consignments || consignments.length <= 1) {
        return null;
    }

    const changedIds = new Set(changedItemsToShow.map((item) => item.id));
    const groups: CartStockPositionsChangedConsignmentGroup[] = [];
    let consignmentNumber = 0;

    consignments.forEach((consignment) => {
        consignmentNumber += 1;

        const allItems = findLineItems(cart, consignment);
        const items = allItems.filter((item) => changedIds.has(item.id));

        if (items.length > 0) {
            groups.push({ consignment, consignmentNumber, items });
        }
    });

    return groups.length > 0 ? groups : null;
}
