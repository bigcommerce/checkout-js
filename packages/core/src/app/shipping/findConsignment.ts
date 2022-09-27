import { Consignment } from '@bigcommerce/checkout-sdk';
import { find, includes } from 'lodash';

export default function findConsignment(
    consignments: Consignment[],
    itemId: string,
): Consignment | undefined {
    return find(consignments, (consignment) => includes(consignment.lineItemIds, itemId));
}
