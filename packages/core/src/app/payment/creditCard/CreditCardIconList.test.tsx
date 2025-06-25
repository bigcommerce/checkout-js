import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CreditCardIconList from './CreditCardIconList';

describe('CreditCardIconList', () => {
    it('filters out card types without icon', () => {
        render(<CreditCardIconList cardTypes={['visa', 'mastercard', 'foo']} />);

        expect(screen.getByText('Visa')).toBeInTheDocument();
        expect(screen.getByText('Master')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('renders nothing if no cards have icon', () => {
        render(<CreditCardIconList cardTypes={['foo', 'bar']} />);

        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('renders all class names correctly', () => {
        const { container } = render(
            <CreditCardIconList
                cardTypes={['visa', 'mastercard', 'foo', 'diners-club']}
                selectedCardType="mastercard"
            />,
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        // eslint-disable-next-line testing-library/no-container
        expect(container.getElementsByClassName('is-active').length).toBe(1);
        // eslint-disable-next-line testing-library/no-container
        expect(container.getElementsByClassName('not-active').length).toBe(2);
    });
});
