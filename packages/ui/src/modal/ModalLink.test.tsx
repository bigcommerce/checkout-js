import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ModalLink from './ModalLink';

describe('ModalLink', () => {
    it('renders children', async () => {
        render(
            <ModalLink body={<div>Modal Link</div>} header={<h1>Modal Link Header</h1>}>
                Click me
            </ModalLink>,
        );

        expect(screen.getByText('Click me')).toBeInTheDocument();
        expect(screen.queryByText('Modal Link')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Link Header')).not.toBeInTheDocument();

        await userEvent.click(screen.getByText('Click me'));

        expect(screen.getByText('Modal Link')).toBeInTheDocument();
        expect(screen.getByText('Modal Link Header')).toBeInTheDocument();
    });
});
