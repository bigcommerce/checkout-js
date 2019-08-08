import { shallow } from 'enzyme';
import React from 'react';

import { IconCardAmex, IconCardDinersClub, IconCardDiscover, IconCardJCB, IconCardMaestro, IconCardMastercard, IconCardUnionPay, IconCardVisa } from '../../ui/icon';

import CreditCardIcon from './CreditCardIcon';

describe('CreditCardIcon', () => {
    it('returns American Express card icon', () => {
        expect(shallow(<CreditCardIcon cardType="american-express" />).find(IconCardAmex))
            .toHaveLength(1);
    });

    it('returns Diners Club card icon', () => {
        expect(shallow(<CreditCardIcon cardType="diners-club" />).find(IconCardDinersClub))
            .toHaveLength(1);
    });

    it('returns Discover card icon', () => {
        expect(shallow(<CreditCardIcon cardType="discover" />).find(IconCardDiscover))
            .toHaveLength(1);
    });

    it('returns JCB card icon', () => {
        expect(shallow(<CreditCardIcon cardType="jcb" />).find(IconCardJCB))
            .toHaveLength(1);
    });

    it('returns Maestro card icon', () => {
        expect(shallow(<CreditCardIcon cardType="maestro" />).find(IconCardMaestro))
            .toHaveLength(1);
    });

    it('returns Mastercard card icon', () => {
        expect(shallow(<CreditCardIcon cardType="mastercard" />).find(IconCardMastercard))
            .toHaveLength(1);
    });

    it('returns Union Pay card icon', () => {
        expect(shallow(<CreditCardIcon cardType="unionpay" />).find(IconCardUnionPay))
            .toHaveLength(1);
    });

    it('returns Visa card icon', () => {
        expect(shallow(<CreditCardIcon cardType="visa" />).find(IconCardVisa))
            .toHaveLength(1);
    });

    it('returns default card icon if nothing matches', () => {
        expect(shallow(<CreditCardIcon cardType="foobar" />).hasClass('cardIcon-icon--default'))
            .toEqual(true);
    });

    it('configures icon component with test ID', () => {
        const component = shallow(
            <CreditCardIcon cardType="american-express" />
        );

        expect(component.find(IconCardAmex).prop('testId'))
            .toEqual('credit-card-icon-american-express');
    });
});
