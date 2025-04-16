import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import CheckListSkeleton from './ChecklistSkeleton';

describe('CheckListSkeleton', () => {
    it('does not render checklistskeleton is false', () => {
        const { container } = render(<CheckListSkeleton isLoading={false} rows={2} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.checklist-skeleton')).not.toBeInTheDocument();
    });

    it('renders checklistskeleton if loading is true', () => {
        const { container } = render(<CheckListSkeleton isLoading={true} rows={2} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.checklist-skeleton')).toBeInTheDocument();
    });
});
