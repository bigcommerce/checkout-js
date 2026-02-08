import { type LineItemMap } from '@bigcommerce/checkout-sdk';

export default function getBackorderCount({
    physicalItems,
    digitalItems,
}: LineItemMap): number {
    return [...physicalItems, ...digitalItems].reduce(
        (total, item) => total + (item.stockPosition?.quantityBackordered ?? 0),
        0,
    );
}
