import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import Popover from './Popover';

describe('Popover Component', () => {
    it('renders with whatever child is passed', () => {
        const { container } = render(
            <Popover>
                <h1>Test</h1>
            </Popover>,
        );

        expect(container.innerHTML).toContain('<h1>Test</h1>');
    });
});
