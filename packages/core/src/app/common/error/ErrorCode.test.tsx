import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ErrorCode from './ErrorCode';

describe('ErrorCode', () => {
    it('displays label if passed', () => {
        const label = (
            <div>label</div>
        );

        render(<ErrorCode code="foo" label={label} />);

        expect(screen.getByText('label')).toBeInTheDocument();
        expect(screen.getByText('foo')).toBeInTheDocument();
    });

    it('displays error code and no label, if label is not supplied', () => {
        render(<ErrorCode code="foo" />);

        expect(screen.getByText('foo')).toBeInTheDocument();
    });
});
