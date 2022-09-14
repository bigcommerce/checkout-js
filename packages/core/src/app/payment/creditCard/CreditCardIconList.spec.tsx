import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';

import CreditCardIcon from './CreditCardIcon';
import CreditCardIconList from './CreditCardIconList';

describe('CreditCardIconList', () => {
    it('filters out card types without icon', () => {
        const component = shallow(<CreditCardIconList cardTypes={['visa', 'mastercard', 'foo']} />);

        expect(component.find(CreditCardIcon)).toHaveLength(2);

        expect(component.find(CreditCardIcon).at(0).prop('cardType')).toBe('visa');

        expect(component.find(CreditCardIcon).at(1).prop('cardType')).toBe('mastercard');
    });

    it('renders nothing if no cards have icon', () => {
        const component = shallow(<CreditCardIconList cardTypes={['foo', 'bar']} />);

        expect(component.html()).toBeNull();
    });

    describe('when a credit card is selected', () => {
        let component: ShallowWrapper;

        beforeEach(() => {
            component = shallow(
                <CreditCardIconList
                    cardTypes={['visa', 'mastercard', 'foo', 'diners-club']}
                    selectedCardType="mastercard"
                />,
            );
        });

        it('renders all supported cards', () => {
            expect(component.find(CreditCardIcon)).toHaveLength(3);
        });

        it('applies active class to selected card', () => {
            expect(component.find('.creditCardTypes-list-item').at(1).prop('className')).toMatch(
                'is-active',
            );
        });

        it('applies inactive class to unselected cards', () => {
            expect(component.find('.creditCardTypes-list-item').at(0).prop('className')).toMatch(
                'not-active',
            );

            expect(component.find('.creditCardTypes-list-item').at(2).prop('className')).toMatch(
                'not-active',
            );
        });
    });
});
