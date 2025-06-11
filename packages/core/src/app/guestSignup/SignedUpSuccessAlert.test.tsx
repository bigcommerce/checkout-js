import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import SignedUpSuccessAlert from './SignedUpSuccessAlert';

describe('SignedUpSuccessAlert', () => {
    it('renders the success alert with the correct message', () => {
        render(<SignedUpSuccessAlert />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Your account has been created.')).toBeInTheDocument();
    });
});
