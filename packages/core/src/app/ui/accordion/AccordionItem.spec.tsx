import { mount } from 'enzyme';
import React from 'react';

import AccordionItem from './AccordionItem';

/* eslint-disable react/jsx-no-bind */
describe('AccordionItem', () => {
    it('renders component that matches snapshot', () => {
        const component = mount(
            <AccordionItem
                headerContent={ () => 'Foobar' }
                itemId="foobar"
            >
                Hello world
            </AccordionItem>
        );

        expect(component)
            .toMatchSnapshot();
    });

    it('overrides default class names', () => {
        const component = mount(
            <AccordionItem
                className="item"
                headerClassName="header"
                headerContent={ () => 'Foobar' }
                itemId="foobar"
            >
                Hello world
            </AccordionItem>
        );

        expect(component.exists('.item'))
            .toEqual(true);

        expect(component.exists('.header'))
            .toEqual(true);
    });
});
