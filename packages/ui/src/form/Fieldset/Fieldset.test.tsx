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
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('fieldset')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('legend')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('legend')).toHaveTextContent('Hello world');
        expect(within(screen.getByTestId('test')).getByRole('textbox')).toBeInTheDocument();
    });
});
