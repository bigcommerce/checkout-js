import { shallow } from 'enzyme';
import React from 'react';

import Button, { ButtonSize, ButtonVariant } from './Button';

describe('Button', () => {
    it('matches snapshot', () => {
        expect(shallow(<Button>Hello world</Button>))
            .toMatchSnapshot();
    });

    it('renders button with label', () => {
        expect(shallow(<Button>Hello world</Button>).text())
            .toEqual('Hello world');
    });

    it('renders button in various sizes', () => {
        expect(shallow(<Button size={ ButtonSize.Large }>Hello world</Button>).hasClass('button--large'))
            .toEqual(true);

        expect(shallow(<Button size={ ButtonSize.Small }>Hello world</Button>).hasClass('button--small'))
            .toEqual(true);

        expect(shallow(<Button size={ ButtonSize.Tiny }>Hello world</Button>).hasClass('button--tiny'))
            .toEqual(true);
    });

    it('renders button in various styles', () => {
        expect(shallow(<Button variant={ ButtonVariant.Primary }>Hello world</Button>).hasClass('button--primary'))
            .toEqual(true);

        expect(shallow(<Button variant={ ButtonVariant.Secondary }>Hello world</Button>).hasClass('button--tertiary'))
            .toEqual(true);

        expect(shallow(<Button variant={ ButtonVariant.Action }>Hello world</Button>).hasClass('button--action'))
            .toEqual(true);
    });

    it('renders button in full width', () => {
        expect(shallow(<Button isFullWidth>Hello world</Button>).hasClass('button--slab'))
            .toEqual(true);

        expect(shallow(<Button>Hello world</Button>).hasClass('button--slab'))
            .toEqual(false);
    });

    it('shows loading indicator', () => {
        expect(shallow(<Button isLoading>Hello world</Button>).hasClass('is-loading'))
            .toEqual(true);

        expect(shallow(<Button>Hello world</Button>).hasClass('is-loading'))
            .toEqual(false);
    });

    it('listens to DOM events', () => {
        const handleClick = jest.fn();
        const component = shallow(
            <Button onClick={ handleClick }>
                Hello world
            </Button>
        );

        component.simulate('click');

        expect(handleClick).toHaveBeenCalled();
    });
});
