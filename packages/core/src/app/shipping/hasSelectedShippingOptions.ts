import { Consignment } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

export default function hasSelectedShippingOptions(consignments: Consignment[]): boolean {
    if (!consignments.length) {
        return false;
    }

    return every(
        consignments,
        (consignment) =>
            consignment.selectedShippingOption &&
            consignment.selectedShippingOption.id &&
            // Selected option is available
            consignment.availableShippingOptions &&
            consignment.availableShippingOptions.filter(
                ({ id }) => id === consignment.selectedShippingOption?.id,
            ).length,
    );
}
