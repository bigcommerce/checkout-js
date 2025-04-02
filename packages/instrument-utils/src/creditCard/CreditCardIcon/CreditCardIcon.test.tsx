import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { CreditCardIcon } from './';

describe('CreditCardIcon', () => {
    const cardTests = [
        { cardType: 'american-express', expectedText: 'Amex' },
        { cardType: 'diners-club', expectedText: 'Diners Club' },
        { cardType: 'discover', expectedText: 'Discover' },
        { cardType: 'jcb', expectedText: 'JCB' },
        { cardType: 'maestro', expectedText: 'Maestro' },
        { cardType: 'mastercard', expectedText: 'Master' },
        { cardType: 'unionpay', expectedText: 'UnionPay' },
        { cardType: 'visa', expectedText: 'Visa' },
        { cardType: 'cb', expectedText: 'CB' },
        { cardType: 'mada', expectedText: 'Mada' },
        { cardType: 'carnet', expectedText: 'Carnet' },
        { cardType: 'elo', expectedText: 'Elo' },
        { cardType: 'hiper', expectedText: 'Hiper' },
        { cardType: 'troy', expectedText: 'Troy' },
    ];

    it.each(cardTests)('returns $cardType card icon', ({ cardType, expectedText }) => {
        render(<CreditCardIcon cardType={cardType} />);

        expect(screen.getByTestId(`credit-card-icon-${cardType}`)).toBeInTheDocument();
        expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it('returns default icon', () => {
        const { container } = render(<CreditCardIcon />);

        expect(screen.queryByTestId(`credit-card-icon-default`)).not.toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.cardIcon-icon--default')).toBeInTheDocument();
    });

    it('returns default card icon if nothing matches', () => {
        render(<CreditCardIcon cardType="foobar" />);

        const cardIcon = screen.getAllByRole('generic')[1];

        expect(cardIcon).toHaveClass('cardIcon-icon');
        expect(cardIcon).toHaveClass('cardIcon-icon--default');
        expect(cardIcon).toHaveClass('icon');
        expect(cardIcon).toHaveClass('icon--medium');
    });
});
