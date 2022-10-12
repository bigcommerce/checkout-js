import { render } from 'enzyme';
import React from 'react';

import FormField from './FormField';

describe('FormField', () => {
    it('matches snapshot', () => {
        const props = {
            additionalClassName: 'test',
            labelContent: null,
            label: null,
            onChange: jest.fn(),
            footer: null,
            input: jest.fn(),
            name: 'test',
        };

        expect(render(<FormField {...props} />)).toMatchSnapshot();
    });

    it('matches snapshot when label is type of function', () => {
        const props = {
            additionalClassName: 'test',
            labelContent: null,
            label: jest.fn(),
            onChange: jest.fn(),
            footer: null,
            input: jest.fn(),
            name: 'test',
        };

        expect(render(<FormField {...props} />)).toMatchSnapshot();
    });

    it('matches snapshot when labelContent is provided', () => {
        const props = {
            additionalClassName: 'test',
            labelContent: jest.fn(),
            onChange: jest.fn(),
            footer: null,
            input: jest.fn(),
            name: 'test',
        };

        expect(render(<FormField {...props} />)).toMatchSnapshot();
    });
});
