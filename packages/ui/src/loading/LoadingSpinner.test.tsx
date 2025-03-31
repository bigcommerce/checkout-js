import React from 'react';
import '@testing-library/jest-dom';

import { render } from '@bigcommerce/checkout/test-utils';

import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render the loading spinner', () => {
        const { container } = render(<LoadingSpinner isLoading={true} />);

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.loadingSpinner')).toBeInTheDocument();
    });

    it('should not render the loading spinner if prop passed is false', () => {
        render(<LoadingSpinner isLoading={false} />);

        const { container } = render(<LoadingSpinner isLoading={false} />);

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.loadingSpinner')).not.toBeInTheDocument();
    });
});
