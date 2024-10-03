import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CustomChecklistItem from './CustomChecklistItem';

describe('CustomChecklistItem', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders custom checklist item', () => {
        render(<CustomChecklistItem
            content="Content"
            htmlId="htmlId"
        />);

        const listItem = screen.getByText('Content');

        expect(listItem).toBeInTheDocument();
        expect(listItem).toHaveAttribute('id', 'htmlId');
    });
});
