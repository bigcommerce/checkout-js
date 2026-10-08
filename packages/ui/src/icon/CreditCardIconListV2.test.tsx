import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { CreditCardIconListV2 } from './CreditCardIconListV2';

describe('CreditCardIconListV2', () => {
    const cardTypes = ['american-express', 'visa', 'discover', 'mastercard', 'jcb'];
    const moreCardsLabel = 'Show more accepted cards';

    it('shows the first cards inline and the rest behind a +N chip', () => {
        render(
            <CreditCardIconListV2
                cardTypes={cardTypes}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
            />,
        );

        expect(screen.getByTestId('american-express-icon')).toBeInTheDocument();
        expect(screen.getByTestId('visa-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('discover-icon')).not.toBeInTheDocument();
        expect(screen.getByText('+3')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: moreCardsLabel })).toBeInTheDocument();
    });

    it('ignores card types without an icon', () => {
        render(
            <CreditCardIconListV2
                cardTypes={['foo', 'visa', 'bar', 'mastercard']}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
            />,
        );

        expect(screen.getByTestId('visa-icon')).toBeInTheDocument();
        expect(screen.getByTestId('mastercard-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('credit-card-overflow')).not.toBeInTheDocument();
    });

    it('renders nothing if no cards have an icon', () => {
        render(
            <CreditCardIconListV2
                cardTypes={['foo', 'bar']}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
            />,
        );

        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('lists the remaining cards in the tooltip on click', async () => {
        render(
            <CreditCardIconListV2
                cardTypes={cardTypes}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: moreCardsLabel }));

        expect(await screen.findByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('discover-overflow-icon')).toBeInTheDocument();
        expect(screen.getByTestId('mastercard-overflow-icon')).toBeInTheDocument();
        expect(screen.getByTestId('jcb-overflow-icon')).toBeInTheDocument();
    });

    it('does not select the enclosing radio when the tooltip is clicked', async () => {
        const handleChange = jest.fn();

        render(
            <label>
                <input onChange={handleChange} type="radio" />
                <CreditCardIconListV2
                    cardTypes={cardTypes}
                    maxVisibleCardTypes={2}
                    moreCardsLabel={moreCardsLabel}
                />
            </label>,
        );

        await userEvent.click(screen.getByRole('button', { name: moreCardsLabel }));
        await userEvent.click(screen.getByTestId('discover-overflow-icon'));
        await userEvent.click(screen.getByTestId('credit-card-overflow-tooltip'));

        expect(handleChange).not.toHaveBeenCalled();
        expect(screen.getByRole('radio')).not.toBeChecked();
    });

    it('does not render a chip when all cards fit', () => {
        render(
            <CreditCardIconListV2
                cardTypes={['visa', 'mastercard']}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
            />,
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.queryByTestId('credit-card-overflow')).not.toBeInTheDocument();
    });

    it('keeps the detected card visible so it can be highlighted', () => {
        render(
            <CreditCardIconListV2
                cardTypes={cardTypes}
                maxVisibleCardTypes={2}
                moreCardsLabel={moreCardsLabel}
                selectedCardType="jcb"
            />,
        );

        expect(screen.getByTestId('jcb-icon')).toHaveClass('is-active');
        expect(screen.getByTestId('american-express-icon')).toHaveClass('not-active');
        expect(screen.getByTestId('visa-icon')).toHaveClass('not-active');
        expect(screen.getByText('+2')).toBeInTheDocument();
    });
});
