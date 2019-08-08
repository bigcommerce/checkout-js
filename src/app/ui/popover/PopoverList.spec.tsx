import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import PopoverList from './PopoverList';

describe('Popover Component', () => {
    const items = [
        { content: 'Lorem', id: 'x' },
        { content: 'Ipsum', id: 'y' },
        { content: 'Foo', id: 'z' },
    ];

    it('renders list with passed items', () => {
        const tree = shallow(<PopoverList items={ items }></PopoverList>);

        expect(toJson(tree)).toMatchSnapshot();
    });

    it('renders empty list when empty array is passed', () => {
        const tree = shallow(<PopoverList items={ [] }></PopoverList>);

        expect(toJson(tree)).toMatchSnapshot();
    });

    it('renders list with highlighted item', () => {
        const tree = shallow(<PopoverList items={ items } highlightedIndex={ 1 }></PopoverList>);

        expect(tree.find('.popoverList-item').at(0).hasClass('is-active')).toBeFalsy();
        expect(tree.find('.popoverList-item').at(1).hasClass('is-active')).toBeTruthy();
        expect(tree.find('.popoverList-item').at(2).hasClass('is-active')).toBeFalsy();
    });

    it('renders list with highlighted text', () => {
        const highlightedContent = [
            <strong key="1">Ips</strong>,
            <React.Fragment key="2">um</React.Fragment>,
        ];

        const tree = shallow(<PopoverList items={[
            items[0],
            { content: highlightedContent, id: 'y' },
            items[1],
        ]}></PopoverList>);

        expect(toJson(tree.find('.popoverList-item').at(1))).toMatchSnapshot();
    });
});
