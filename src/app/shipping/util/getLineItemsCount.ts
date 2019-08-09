import { LineItem } from '@bigcommerce/checkout-sdk';
import { reduce } from 'lodash';

export default function getLineItemsCount(lineItems: LineItem[]): number {
    return reduce(lineItems, (total, item) => total + item.quantity, 0);
}
