import { fireEvent, render, screen } from '@testing-library/react';
import React, { useContext } from 'react';

import Accordion from './Accordion';
import AccordionContext from './AccordionContext';

interface AccordionItemMockProps {
    label: string;
    id: string;
}

const AccordionItemMock = ({ label, id }: AccordionItemMockProps) => {
    const { onToggle, selectedItemId } = useContext(AccordionContext);

    return (
        <li>
            <button data-test={id} onClick={() => onToggle(id)}>
                {label} {selectedItemId === id ? 'selected' : ''}
            </button>
        </li>
    );
};

describe('Accordion', () => {
    let items: Array<{ label: string; id: string }>;

    beforeEach(() => {
        items = [
            { label: 'Foo', id: 'foo' },
            { label: 'Bar', id: 'bar' },
        ];
    });

    it('selects default item when component is mounted', () => {
        render(
            <Accordion defaultSelectedItemId="bar">
                {items.map(({ label, id }) => (
                    <AccordionItemMock id={id} key={id} label={label} />
                ))}
            </Accordion>,
        );

        expect(screen.getByText('Bar selected')).toBeInTheDocument();
    });

    it('changes selected item when user interacts with component', () => {
        render(
            <Accordion>
                {items.map(({ label, id }) => (
                    <AccordionItemMock id={id} key={id} label={label} />
                ))}
            </Accordion>,
        );

        fireEvent.click(screen.getByTestId('foo'));

        expect(screen.getByText('Foo selected')).toBeInTheDocument();
        expect(screen.queryByText('Bar selected')).not.toBeInTheDocument();
    });

    it('triggers callback when different item is selected', () => {
        const onSelect = jest.fn();

        render(
            <Accordion onSelect={onSelect}>
                {items.map(({ label, id }) => (
                    <AccordionItemMock id={id} key={id} label={label} />
                ))}
            </Accordion>,
        );

        fireEvent.click(screen.getByTestId('foo'));

        expect(onSelect).toHaveBeenCalledWith('foo');
    });

    it('does not change selected item if component is disabled', () => {
        const onSelect = jest.fn();

        render(
            <Accordion defaultSelectedItemId="bar" isDisabled onSelect={onSelect}>
                {items.map(({ label, id }) => (
                    <AccordionItemMock id={id} key={id} label={label} />
                ))}
            </Accordion>,
        );

        fireEvent.click(screen.getByTestId('foo'));

        expect(screen.queryByText('Foo selected')).not.toBeInTheDocument();
        expect(screen.getByText('Bar selected')).toBeInTheDocument();

        expect(onSelect).not.toHaveBeenCalled();
    });
});
