import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PasswordSavedSuccessAlert from './PasswordSavedSuccessAlert';

describe('PasswordSavedSuccessAlert', () => {
    it('renders the success alert with the correct message', () => {
        render(<PasswordSavedSuccessAlert />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Your password has been saved.')).toBeInTheDocument();
    });
});
