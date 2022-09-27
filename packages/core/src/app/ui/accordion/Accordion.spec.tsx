import { mount } from 'enzyme';
import React from 'react';

import Accordion from './Accordion';
import AccordionItem from './AccordionItem';

describe('Accordion', () => {
    let items: Array<{ label: string; id: string }>;

    beforeEach(() => {
        items = [
            { label: 'Foo', id: 'foo' },
            { label: 'Bar', id: 'bar' },
        ];
    });

    it('selects default item when component is mounted', () => {
        const component = mount(
            <Accordion defaultSelectedItemId="bar">
                {items.map(({ label, id }) => (
                    <AccordionItem headerContent={() => label} itemId={id} key={id} />
                ))}
            </Accordion>,
        );

        expect(component.find('.accordion-item--selected').text()).toBe('Bar');
    });

    it('changes selected item when user interacts with component', () => {
        const component = mount(
            <Accordion>
                {items.map(({ label, id }) => (
                    <AccordionItem
                        headerContent={({ onToggle }) => (
                            <div id={id} onClick={() => onToggle(id)}>
                                {label}
                            </div>
                        )}
                        itemId={id}
                        key={id}
                    />
                ))}
            </Accordion>,
        );

        component.find('#foo').simulate('click').update();

        expect(component.find('.accordion-item--selected').text()).toBe('Foo');
    });

    it('triggers callback when different item is selected', () => {
        const onSelect = jest.fn();
        const component = mount(
            <Accordion onSelect={onSelect}>
                {items.map(({ label, id }) => (
                    <AccordionItem
                        headerContent={({ onToggle }) => (
                            <div id={id} onClick={() => onToggle(id)}>
                                {label}
                            </div>
                        )}
                        itemId={id}
                        key={id}
                    />
                ))}
            </Accordion>,
        );

        component.find('#foo').simulate('click').update();

        expect(onSelect).toHaveBeenCalledWith('foo');
    });

    it('does not change selected item if component is disabled', () => {
        const onSelect = jest.fn();
        const component = mount(
            <Accordion defaultSelectedItemId="bar" isDisabled onSelect={onSelect}>
                {items.map(({ label, id }) => (
                    <AccordionItem
                        headerContent={({ onToggle }) => (
                            <div id={id} onClick={() => onToggle(id)}>
                                {label}
                            </div>
                        )}
                        itemId={id}
                        key={id}
                    />
                ))}
            </Accordion>,
        );

        component.find('#foo').simulate('click').update();

        expect(component.find('.accordion-item--selected').text()).not.toBe('Foo');

        expect(onSelect).not.toHaveBeenCalledWith('foo');
    });
});
