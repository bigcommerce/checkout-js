import { Consignment } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

export default function isSelectedShippingOptionValid(consignments: Consignment[]): boolean {
    if (!consignments.length) {
        return false;
    }

    return every(
        consignments,
        (consignment) =>
        (consignment.availableShippingOptions &&
            consignment.availableShippingOptions.filter(
                ({ id }) => id === consignment.selectedShippingOption?.id,
            ).length)
    );
}
