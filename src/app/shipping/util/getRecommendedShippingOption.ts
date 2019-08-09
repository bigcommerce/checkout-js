import { Consignment, ShippingOption } from '@bigcommerce/checkout-sdk';

export default function getRecommendedShippingOption(consignment: Consignment): ShippingOption | undefined {
    if (consignment.selectedShippingOption ||
        !consignment.availableShippingOptions ||
        !consignment.availableShippingOptions.length
    ) {
        return;
    }

    return consignment.availableShippingOptions.find((option: { isRecommended: any }) => option.isRecommended);
}
