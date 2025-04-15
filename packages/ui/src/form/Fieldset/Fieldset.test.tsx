/* eslint-disable testing-library/no-container */
import React from 'react';

import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import Fieldset from './Fieldset';

describe('Fieldset', () => {
    it('renders component with test ID, legend and children', () => {
        const { container } = render(
            <Fieldset legend={<legend>Hello world</legend>} testId="test">
                <input type="text" />
            </Fieldset>,
        );

        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(container.querySelector('fieldset')).toBeInTheDocument();
        expect(container.querySelector('legend')).toBeInTheDocument();
        expect(container.querySelector('legend')).toHaveTextContent('Hello world');
        expect(within(screen.getByTestId('test')).getByRole('textbox')).toBeInTheDocument();
    });
});
