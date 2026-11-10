import { type Consignment, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import { omit, uniqWith } from 'lodash';

import { isEqualAddress } from '../../address';

export const getConsignmentAddressOptions = (
    consignments: Consignment[],
    existingAddresses: CustomerAddress[],
): CustomerAddress[] =>
    uniqWith(
        consignments.map(({ shippingAddress }) => omit(shippingAddress, 'email')),
        isEqualAddress,
    )
        .filter(
            (consignmentAddress) =>
                !existingAddresses.some((address) => isEqualAddress(address, consignmentAddress)),
        )
        .map((consignmentAddress, index) => ({
            ...consignmentAddress,
            id: -(index + 1),
            type: 'residential',
        }));
