import { render, screen } from '@bigcommerce/checkout/test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';


import Autocomplete from './Autocomplete';
import AutocompleteItem from './autocomplete-item';

describe('Autocomplete Component', () => {
    const items: AutocompleteItem[] = [
        { label: 'foo', id: 'x', value: 'vfoo' },
        { label: 'bar', id: 'y', value: 'vbar' },
        {
            label: 'zoo',
            id: 'z',
            value: 'vzoo',
            highlightedSlices: [{ offset: 0, length: 2 }],
        },
    ];

    it('triggers onChange function when input value is changed and renders popover list', async () => {
        const onChange = jest.fn();
        const { container } = render(
            <Autocomplete items={items} onChange={onChange}>
                <h1>Bob</h1>
            </Autocomplete>,
        );

        await userEvent.type(screen.getByRole('textbox'), 'zo');

        expect(onChange).toHaveBeenCalledWith('zo', true);

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        const popoverListItems = container.getElementsByClassName('popoverList-item')

        expect(popoverListItems).toHaveLength(3);
        expect(container.innerHTML).toContain('<strong>zo</strong>o');
    });

    it('trigger onSelect function when an item is clicked', async () => {
        let value = '';
        const onSelect = (item: typeof items[number]) => {
            value = item.value as string;
            rerender(Component());
        };

        const Component = () => (
            <Autocomplete initialValue={value} items={items} onSelect={onSelect} />
          );
        const { container, rerender } = render(Component());


        await userEvent.type(screen.getByRole('textbox'), 'foo');
        await userEvent.click(screen.getByText('foo'));

        expect(container.innerHTML).toContain('vfoo');
    });

    it('select item by keyboard', async () => {
        let value = '';
        const onSelect = (item: typeof items[number]) => {
            value = item.value as string;
            rerender(Component());
        };

        const Component = () => (
            <Autocomplete initialValue={value} items={items} onSelect={onSelect} />
          );
        const { container, rerender } = render(Component());

        await userEvent.type(screen.getByRole('textbox'), 'zo');
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{arrowdown}');
        await userEvent.keyboard('{enter}');

        expect(container.innerHTML).toContain('vbar');
    });
});
