import { Consignment, LineItemMap } from '@bigcommerce/checkout-sdk';
import { reduce } from 'lodash';

export default function hasUnassignedLineItems(
    consignments: Consignment[],
    lineItems: LineItemMap,
): boolean {
    const totalAssigned = reduce(
        consignments,
        (total, consignment) => total + consignment.lineItemIds.length,
        0,
    );

    return totalAssigned < lineItems.physicalItems.filter((item) => !item.addedByPromotion).length;
}
