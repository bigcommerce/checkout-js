import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ManageInstrumentsAlert from './ManageInstrumentsAlert';

describe('ManageInstrumentsAlert', () => {
    it('displays error message caused by authentication issue', () => {
        const error = { status: 401 };

        render(<ManageInstrumentsAlert error={error} />);

        expect(screen.getByText(/There was a problem authorizing your request/)).toBeInTheDocument();
    });

    it('displays error message caused by client issue', () => {
        const error = { status: 400 };

        render(<ManageInstrumentsAlert error={error} />);

        expect(screen.getByText(/payment method no longer exists or cannot be deleted/)).toBeInTheDocument();
    });

    it('displays error message caused by server issue', () => {
        const error = { status: 500 };

        render(<ManageInstrumentsAlert error={error} />);

        expect(screen.getByText(/please try again/)).toBeInTheDocument();
    });
});
