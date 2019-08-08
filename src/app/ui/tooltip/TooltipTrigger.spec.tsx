import { mount } from 'enzyme';
import React from 'react';

import TooltipTrigger from './TooltipTrigger';

describe('TooltipTrigger', () => {
    it('shows tooltip when mouse enters', () => {
        const component = mount(
            <TooltipTrigger tooltip={ <div>Hello world</div> }>
                <button>Foobar</button>
            </TooltipTrigger>
        );

        component.simulate('mouseenter');

        expect(component.state('shouldShow'))
            .toEqual(true);
    });

    it('shows tooltip when in focus', () => {
        const component = mount(
            <TooltipTrigger tooltip={ <div>Hello world</div> }>
                <button>Foobar</button>
            </TooltipTrigger>
        );

        component.simulate('focus');

        expect(component.state('shouldShow'))
            .toEqual(true);
    });

    it('hides tooltip when mouse leaves', () => {
        const component = mount(
            <TooltipTrigger tooltip={ <div>Hello world</div> }>
                <button>Foobar</button>
            </TooltipTrigger>
        );

        component.simulate('mouseenter');
        component.simulate('mouseleave');

        expect(component.state('shouldShow'))
            .toEqual(false);
    });

    it('hides tooltip when no longer in focus', () => {
        const component = mount(
            <TooltipTrigger tooltip={ <div>Hello world</div> }>
                <button>Foobar</button>
            </TooltipTrigger>
        );

        component.simulate('focus');
        component.simulate('blur');

        expect(component.state('shouldShow'))
            .toEqual(false);
    });
});
