import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import CustomerSkeleton from './CustomerSkeleton';

describe('CheckListSkeleton', () => {
    it('does not render customerskeleton if loading is false', () => {
        const { container } = render(<CustomerSkeleton isLoading={false} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.customer-skeleton')).not.toBeInTheDocument();
    });

    it('renders customerskeleton if loading is true', () => {
        const { container } = render(<CustomerSkeleton isLoading={true} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.customer-skeleton')).toBeInTheDocument();
    });
});
