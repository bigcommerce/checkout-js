import { getOrder } from '../order/orders.mock';

import mapFromPayments from './mapFromPayments';

describe('mapFromPayments()', () => {
    it('returns mapped gift certificates', () => {
        expect(mapFromPayments(getOrder().payments || [])).toEqual([
            {
                code: 'gc',
                remaining: 3,
                used: 7,
                balance: 10,
                purchaseDate: '',
            },
        ]);
    });
});
