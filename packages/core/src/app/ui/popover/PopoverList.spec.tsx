import { mount } from 'enzyme';
import React from 'react';

import PopoverList from './PopoverList';

describe('Popover Component', () => {
    const items = [
        { content: 'Lorem', id: 'x' },
        { content: 'Ipsum', id: 'y' },
        { content: 'Foo', id: 'z' },
    ];

    it('renders list with passed items', () => {
        const tree = mount(<PopoverList items={items} />);

        expect(tree).toMatchSnapshot();
    });

    it('renders empty list when empty array is passed', () => {
        const tree = mount(<PopoverList items={[]} />);

        expect(tree).toMatchSnapshot();
    });

    it('renders list with highlighted item', () => {
        const tree = mount(<PopoverList highlightedIndex={1} items={items} />);

        expect(tree.find('.popoverList-item').at(0).hasClass('is-active')).toBe(false);
        expect(tree.find('.popoverList-item').at(1).hasClass('is-active')).toBe(true);
        expect(tree.find('.popoverList-item').at(2).hasClass('is-active')).toBe(false);
    });

    it('renders list with passed testId', () => {
        const tree = mount(<PopoverList items={items} testId='testId' />);

        expect(tree.prop('testId')).toBeDefined();
    });

    it('renders list with highlighted text', () => {
        const highlightedContent = [
            <strong key="1">Ips</strong>,
            <React.Fragment key="2">um</React.Fragment>,
        ];

        const tree = mount(
            <PopoverList items={[items[0], { content: highlightedContent, id: 'y' }, items[1]]} />,
        );

        expect(tree.find('.popoverList-item').at(1)).toMatchSnapshot();
    });
});
