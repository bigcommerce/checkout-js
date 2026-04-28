import { type LineItemMap } from '@bigcommerce/checkout-sdk';

export default function getBackorderCount({
    physicalItems,
    digitalItems,
}: LineItemMap): number {
    return [...physicalItems, ...digitalItems].reduce(
        (total, item) => total + Number(item.stockPosition?.quantityBackordered ?? item.quantityBackordered ?? 0),
        0,
    );
}
