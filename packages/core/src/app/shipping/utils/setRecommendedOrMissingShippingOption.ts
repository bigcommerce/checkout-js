import { type CheckoutSelectors, type Consignment, type ShippingRequestOptions } from '@bigcommerce/checkout-sdk';

const createShippingOptionsMap = (consignments: Consignment[]): Map<string, string | undefined> => {
    return new Map(
        consignments.map((consignment) => [consignment.id, consignment.selectedShippingOption?.id]),
    );
};

export const setRecommendedOrMissingShippingOption = async (
    previousConsignment: Consignment[],
    currentConsignments: Consignment[],
    selectConsignmentShippingOption: (
        consignmentId: string,
        shippingOptionId: string,
        options?: ShippingRequestOptions<object>,
    ) => Promise<CheckoutSelectors>,
): Promise<void> => {
    const previousShippingOptions = createShippingOptionsMap(previousConsignment);

    for (const consignment of currentConsignments) {
        if (!consignment.selectedShippingOption) {
            const previousShippingOptionId = previousShippingOptions.get(consignment.id);

            if (previousShippingOptionId) {
                // eslint-disable-next-line no-await-in-loop
                await selectConsignmentShippingOption(consignment.id, previousShippingOptionId);

                continue;
            }

            const recommendedOption = consignment.availableShippingOptions?.find(
                (option) => option.isRecommended,
            );

            if (recommendedOption) {
                // eslint-disable-next-line no-await-in-loop
                await selectConsignmentShippingOption(consignment.id, recommendedOption.id);
            }
        }
    }
};
