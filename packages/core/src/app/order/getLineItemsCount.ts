import { LineItemMap } from '@bigcommerce/checkout-sdk';

export default function getLineItemsCount({
    physicalItems,
    digitalItems,
    giftCertificates,
    customItems,
}: LineItemMap): number {
    return (
        physicalItems.length +
        digitalItems.length +
        giftCertificates.length +
        (customItems || []).length
    );
}
