import { getConsignment } from './consignment.mock';
import findConsignment from './findConsignment';

describe('findConsignment()', () => {
    it('returns none if no match', () => {
        expect(findConsignment([getConsignment()], '666')).toBeFalsy();
    });

    it('returns consignment if there is a match', () => {
        expect(findConsignment([getConsignment()], getConsignment().lineItemIds[0])).toEqual(
            getConsignment(),
        );
    });
});
