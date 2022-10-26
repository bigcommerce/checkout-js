import { shallow } from 'enzyme';
import React from 'react';

import Button, { ButtonSize, ButtonVariant } from './Button';

describe('Button', () => {
    it('matches snapshot', () => {
        expect(shallow(<Button>Hello world</Button>)).toMatchSnapshot();
    });

    it('renders button with label', () => {
        expect(shallow(<Button>Hello world</Button>).text()).toBe('Hello world');
    });

    it('renders button in various sizes', () => {
        expect(
            shallow(<Button size={ButtonSize.Large}>Hello world</Button>).hasClass('button--large'),
        ).toBe(true);

        expect(
            shallow(<Button size={ButtonSize.Small}>Hello world</Button>).hasClass('button--small'),
        ).toBe(true);

        expect(
            shallow(<Button size={ButtonSize.Tiny}>Hello world</Button>).hasClass('button--tiny'),
        ).toBe(true);
    });

    it('renders button in various styles', () => {
        expect(
            shallow(<Button variant={ButtonVariant.Primary}>Hello world</Button>).hasClass(
                'button--primary',
            ),
        ).toBe(true);

        expect(
            shallow(<Button variant={ButtonVariant.Secondary}>Hello world</Button>).hasClass(
                'button--tertiary',
            ),
        ).toBe(true);

        expect(
            shallow(<Button variant={ButtonVariant.Action}>Hello world</Button>).hasClass(
                'button--action',
            ),
        ).toBe(true);
    });

    it('renders button in full width', () => {
        expect(shallow(<Button isFullWidth>Hello world</Button>).hasClass('button--slab')).toBe(
            true,
        );

        expect(shallow(<Button>Hello world</Button>).hasClass('button--slab')).toBe(false);
    });

    it('shows loading indicator', () => {
        expect(shallow(<Button isLoading>Hello world</Button>).hasClass('is-loading')).toBe(true);

        expect(shallow(<Button>Hello world</Button>).hasClass('is-loading')).toBe(false);
    });

    it('listens to DOM events', () => {
        const handleClick = jest.fn();
        const component = shallow(<Button onClick={handleClick}>Hello world</Button>);

        component.simulate('click');

        expect(handleClick).toHaveBeenCalled();
    });
});
