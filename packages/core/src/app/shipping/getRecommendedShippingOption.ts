import { ShippingOption } from '@bigcommerce/checkout-sdk';

export default function getRecommendedShippingOption(
    availableShippingOptions: ShippingOption[],
): ShippingOption | undefined {
    if (!availableShippingOptions) {
        return;
    }

    return availableShippingOptions.find(
        ({ isRecommended }: { isRecommended: any }) => isRecommended,
    );
}
