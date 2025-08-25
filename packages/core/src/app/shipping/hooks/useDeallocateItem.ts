import { type Consignment, type ConsignmentCreateRequestBody } from "@bigcommerce/checkout-sdk";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

export const useDeallocateItem = () => {
    const {
        checkoutService: { createConsignments, deleteConsignment },
    } = useCheckout();

    // this is a workaround to handle removing an item from a consignment
    // current consignment API does not support removing an item directly - Oct 2024

    const deleteItem = async (consignmentRequest: ConsignmentCreateRequestBody, itemId: string, consignment: Consignment) => {
        let consignmentIdToBeDeleted: string | undefined = consignment.id;

        if (consignment.lineItemIds.length > 1) {
            const checkoutResponse = await createConsignments([consignmentRequest]);

            const consignmentsReponse = checkoutResponse.data.getConsignments();

            consignmentIdToBeDeleted = consignmentsReponse?.find((c) =>
                c.lineItemIds.find((lineItemId) => lineItemId === itemId),
            )?.id;
        }

        if (!consignmentIdToBeDeleted) {
            throw new Error('Unable to find consignment to delete');
        }

        deleteConsignment(consignmentIdToBeDeleted);
    }

    return deleteItem;
}
