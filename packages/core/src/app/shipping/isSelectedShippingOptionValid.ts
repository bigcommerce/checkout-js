import { type Consignment } from '@bigcommerce/checkout-sdk';
import { every } from 'lodash';

export default function isSelectedShippingOptionValid(consignments: Consignment[]): boolean {
    if (!consignments.length) {
        return false;
    }

    return every(
        consignments,
        consignment => {
            if (consignment.selectedShippingOption?.type === 'custom') {
                return true;
            }

            return consignment.availableShippingOptions &&
                consignment.availableShippingOptions.find(
                    ({ id }) => id === consignment.selectedShippingOption?.id
                );
        }
    );
}
