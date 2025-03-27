import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { MultiLineText } from '.';

describe('MultiLineText', () => {
    it('should render MultiLineText', () => {
        const text = 'Lorem ipsum';

        render(<MultiLineText>{text}</MultiLineText>);

        expect(screen.getByText(text)).toBeInTheDocument();
    });
})
