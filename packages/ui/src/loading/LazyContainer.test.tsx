import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import LazyContainer from './LazyContainer';

describe('LazyContainer', () => {
    it('should render the child content', () => {
        const node = <div>Loading</div>;

        render(
            <LazyContainer loadingSkeleton={node}>
                <div>Test</div>
            </LazyContainer>,
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
    });
});
