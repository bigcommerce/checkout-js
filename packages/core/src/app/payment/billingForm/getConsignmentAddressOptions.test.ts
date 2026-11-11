import { type Address, type Consignment } from '@bigcommerce/checkout-sdk';

import { getAddress } from '../../address/address.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';

import { getConsignmentAddressOptions } from './getConsignmentAddressOptions';

describe('getConsignmentAddressOptions', () => {
    const firstAddress: Address = { ...getAddress(), address1: '1 Consignment Way' };
    const secondAddress: Address = { ...getAddress(), address1: '2 Consignment Way' };

    const createConsignment = (id: string, shippingAddress: Address): Consignment => ({
        ...getConsignment(),
        id,
        shippingAddress,
        address: shippingAddress,
    });

    it('returns each shipping address with a placeholder id and residential type', () => {
        const options = getConsignmentAddressOptions(
            [createConsignment('1', firstAddress), createConsignment('2', secondAddress)],
            [],
        );

        expect(options).toEqual([
            { ...firstAddress, id: -1, type: 'residential' },
            { ...secondAddress, id: -2, type: 'residential' },
        ]);
    });

    it('removes the email from the shipping addresses', () => {
        const [option] = getConsignmentAddressOptions(
            [createConsignment('1', { ...firstAddress, email: '' } as Address)],
            [],
        );

        expect(option).not.toHaveProperty('email');
    });

    it('lists a shipping address only once when several consignments share it', () => {
        const options = getConsignmentAddressOptions(
            [createConsignment('1', firstAddress), createConsignment('2', { ...firstAddress })],
            [],
        );

        expect(options).toHaveLength(1);
    });

    it('leaves out shipping addresses that match an existing address', () => {
        const savedAddress = getCustomer().addresses[0];

        const options = getConsignmentAddressOptions(
            [
                createConsignment('1', { ...getAddress(), ...savedAddress }),
                createConsignment('2', secondAddress),
            ],
            [savedAddress],
        );

        expect(options).toEqual([{ ...secondAddress, id: -1, type: 'residential' }]);
    });

    it('returns no options when there are no consignments', () => {
        expect(getConsignmentAddressOptions([], [])).toEqual([]);
    });
});
