import { shallow } from 'enzyme';
import React from 'react';

import {
    IconCardAmex,
    IconCardCarnet,
    IconCardCB,
    IconCardDankort,
    IconCardDinersClub,
    IconCardDiscover,
    IconCardElo,
    IconCardHipercard,
    IconCardJCB,
    IconCardMada,
    IconCardMaestro,
    IconCardMastercard,
    IconCardTroy,
    IconCardUnionPay,
    IconCardVisa,
} from '@bigcommerce/checkout/ui';

import { CreditCardIcon } from '.';

describe('CreditCardIcon', () => {
    it('returns American Express card icon', () => {
        expect(
            shallow(<CreditCardIcon cardType="american-express" />).find(IconCardAmex),
        ).toHaveLength(1);
    });

    it('returns Diners Club card icon', () => {
        expect(
            shallow(<CreditCardIcon cardType="diners-club" />).find(IconCardDinersClub),
        ).toHaveLength(1);
    });

    it('returns Discover card icon', () => {
        expect(shallow(<CreditCardIcon cardType="discover" />).find(IconCardDiscover)).toHaveLength(
            1,
        );
    });

    it('returns JCB card icon', () => {
        expect(shallow(<CreditCardIcon cardType="jcb" />).find(IconCardJCB)).toHaveLength(1);
    });

    it('returns Maestro card icon', () => {
        expect(shallow(<CreditCardIcon cardType="maestro" />).find(IconCardMaestro)).toHaveLength(
            1,
        );
    });

    it('returns Mastercard card icon', () => {
        expect(
            shallow(<CreditCardIcon cardType="mastercard" />).find(IconCardMastercard),
        ).toHaveLength(1);
    });

    it('returns Union Pay card icon', () => {
        expect(shallow(<CreditCardIcon cardType="unionpay" />).find(IconCardUnionPay)).toHaveLength(
            1,
        );
    });

    it('returns Visa card icon', () => {
        expect(shallow(<CreditCardIcon cardType="visa" />).find(IconCardVisa)).toHaveLength(1);
    });

    it('returns CB card icon', () => {
        expect(shallow(<CreditCardIcon cardType="cb" />).find(IconCardCB)).toHaveLength(1);
    });

    it('returns Mada card icon', () => {
        expect(shallow(<CreditCardIcon cardType="mada" />).find(IconCardMada)).toHaveLength(1);
    });

    it('returns Dankor card icon', () => {
        expect(shallow(<CreditCardIcon cardType="dankort" />).find(IconCardDankort)).toHaveLength(
            1,
        );
    });

    it('returns Carnet card icon', () => {
        expect(shallow(<CreditCardIcon cardType="carnet" />).find(IconCardCarnet)).toHaveLength(1);
    });

    it('returns Elo card icon', () => {
        expect(shallow(<CreditCardIcon cardType="elo" />).find(IconCardElo)).toHaveLength(1);
    });

    it('returns Hipercard card icon', () => {
        expect(shallow(<CreditCardIcon cardType="hiper" />).find(IconCardHipercard)).toHaveLength(
            1,
        );
    });

    it('returns Troy card icon', () => {
        expect(shallow(<CreditCardIcon cardType="troy" />).find(IconCardTroy)).toHaveLength(1);
    });

    it('returns default card icon if nothing matches', () => {
        expect(
            shallow(<CreditCardIcon cardType="foobar" />).hasClass('cardIcon-icon--default'),
        ).toBe(true);
    });

    it('returns default card icon if type is undefined', () => {
        expect(shallow(<CreditCardIcon cardType="" />).hasClass('cardIcon-icon--default')).toBe(
            true,
        );
    });

    it('configures icon component with test ID', () => {
        const component = shallow(<CreditCardIcon cardType="american-express" />);

        expect(component.find(IconCardAmex).prop('testId')).toBe(
            'credit-card-icon-american-express',
        );
    });
});
