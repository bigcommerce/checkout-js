import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import AddressFormSkeleton from './AddressFormSkeleton';

describe('AddressFormSkeleton', () => {
    it('does not render addressformskeleton or children if loading and renderWhileLoading are false', () => {
        const { container } = render(
            <AddressFormSkeleton isLoading={false} renderWhileLoading={false} />,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.address-form-skeleton')).not.toBeInTheDocument();
    });

    it('does not render addressformskeleton if not loading but renders children if renderWhileLoading is true', () => {
        const { container } = render(
            <AddressFormSkeleton isLoading={false} renderWhileLoading={true}>
                child
            </AddressFormSkeleton>,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.address-form-skeleton')).not.toBeInTheDocument();
        expect(screen.getByText('child')).toBeInTheDocument();
    });

    it('renders addressformskeleton if loading but not children if renderWhileLoading is false', () => {
        const { container } = render(
            <AddressFormSkeleton isLoading={true} renderWhileLoading={false}>
                child
            </AddressFormSkeleton>,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.address-form-skeleton')).toBeInTheDocument();
        expect(screen.queryByText('child')).not.toBeInTheDocument();
    });

    it('renders addressformskeleton if loading but not children if renderWhileLoading is false', () => {
        const { container } = render(
            <AddressFormSkeleton isLoading={true} renderWhileLoading={true}>
                child
            </AddressFormSkeleton>,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.address-form-skeleton')).toBeInTheDocument();
        expect(screen.getByText('child')).toBeInTheDocument();
    });
});
