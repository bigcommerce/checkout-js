import { LineItemMap } from '@bigcommerce/checkout-sdk';

export default function getItemsCount({
    physicalItems,
    digitalItems,
    giftCertificates,
    customItems,
}: LineItemMap): number {
    const totalItemsCount = [...physicalItems, ...digitalItems, ...(customItems || [])].reduce(
        (total, item) => (total += item.quantity),
        0,
    );

    return totalItemsCount + giftCertificates.length;
}
