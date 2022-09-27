import { Consignment, LineItemMap } from '@bigcommerce/checkout-sdk';
import { some } from 'lodash';

import hasUnassignedLineItems from './hasUnassignedLineItems';

export default function isUsingMultiShipping(
    consignments: Consignment[],
    lineItems: LineItemMap,
): boolean {
    if (consignments.length > 1) {
        return true;
    }

    if (
        some(consignments, (consignment) => consignment.lineItemIds.length) &&
        hasUnassignedLineItems(consignments, lineItems)
    ) {
        return true;
    }

    return false;
}
