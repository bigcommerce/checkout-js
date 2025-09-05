import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PopoverList from './PopoverList';

describe('Popover Component', () => {
    const items = [
        { content: 'Lorem', id: 'x' },
        { content: 'Ipsum', id: 'y' },
        { content: 'Foo', id: 'z' },
    ];

    it('renders list with passed items', () => {
        render(<PopoverList items={items} />);

        expect(screen.getByText('Lorem')).toBeInTheDocument();
        expect(screen.getByText('Ipsum')).toBeInTheDocument();
        expect(screen.getByText('Foo')).toBeInTheDocument();
    });

    it('renders empty list when empty array is passed', () => {
        const { container } = render(<PopoverList items={[]} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.getElementsByClassName('popoverList-item')).toHaveLength(0);
    });

    it('renders list with highlighted item', () => {
        const { container } = render(<PopoverList highlightedIndex={1} items={items} />);

        // eslint-disable-next-line testing-library/no-container
        const popoverListItems = container.getElementsByClassName('popoverList-item');

        expect(popoverListItems).toHaveLength(3);

        expect(popoverListItems[0]).not.toHaveClass('is-active');
        expect(popoverListItems[1]).toHaveClass('is-active');
        expect(popoverListItems[2]).not.toHaveClass('is-active');
    });

    it('renders list with passed testId', () => {
        render(<PopoverList items={items} testId="testId" />);

        expect(screen.getByTestId('testId')).toBeInTheDocument();
    });
});
