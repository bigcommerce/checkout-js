import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import LazyContainer from './LazyContainer';

describe('LazyContainer', () => {
    it('should render the loadingSkeleton if passed', () => {
        const node = <div>Test</div>;

        render(
            <LazyContainer loadingSkeleton={node}>
                <div>Test</div>
            </LazyContainer>,
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
    });
});
