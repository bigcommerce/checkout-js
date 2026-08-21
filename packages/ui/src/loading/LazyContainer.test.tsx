import React, { type FunctionComponent } from 'react';

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

    describe('when a child throws ChunkLoadError', () => {
        beforeEach(() => {
            jest.spyOn(console, 'error').mockImplementation();
        });

        afterEach(() => {
            jest.spyOn(console, 'error').mockRestore();
        });

        it('renders the unstable network fallback and calls onError', () => {
            const error = new Error('Loading chunk failed');

            error.name = 'ChunkLoadError';

            const onError = jest.fn();
            const Child: FunctionComponent = () => {
                throw error;
            };

            render(
                <LazyContainer onError={onError}>
                    <Child />
                </LazyContainer>,
            );

            expect(
                screen.getByText(/the server is taking too long to respond/i),
            ).toBeInTheDocument();
            expect(onError).toHaveBeenCalledWith(error);
        });

        it('rethrows errors that are not chunk load errors', () => {
            const error = new Error('Something else');
            const onError = jest.fn();
            const Child: FunctionComponent = () => {
                throw error;
            };

            expect(() =>
                render(
                    <LazyContainer onError={onError}>
                        <Child />
                    </LazyContainer>,
                ),
            ).toThrow(error);
            expect(onError).not.toHaveBeenCalled();
        });
    });
});
