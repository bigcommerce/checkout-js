import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import WalletButtonContainerSkeleton from './WalletButtonContainerSkeleton';

describe('WalletButtonContainerSkeleton', () => {
    it('does not render walletButtonContainerSkeleton is false', () => {
        const { container } = render(
            <WalletButtonContainerSkeleton buttonsCount={2} isLoading={false} />,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.walletbuttons-skeleton')).not.toBeInTheDocument();
    });

    it('renders walletButtonContainerSkeleton if loading is true', () => {
        const { container } = render(
            <WalletButtonContainerSkeleton buttonsCount={2} isLoading={true} />,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.walletbuttons-skeleton')).toBeInTheDocument();
    });
});
