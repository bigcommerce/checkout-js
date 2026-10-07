import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CreditCardIconList from './CreditCardIconList';

describe('CreditCardIconList', () => {
    it('filters out card types without icon', async () => {
        render(<CreditCardIconList cardTypes={['visa', 'mastercard', 'foo']} />);

        expect(await screen.findByText('Visa')).toBeInTheDocument();
        expect(await screen.findByText('Master')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('exposes each icon as an image with an accessible name', async () => {
        render(<CreditCardIconList cardTypes={['visa', 'mastercard']} />);

        expect(await screen.findAllByRole('img')).toHaveLength(2);
        expect(await screen.findByRole('img', { name: 'Visa' })).toBeInTheDocument();
        expect(await screen.findByRole('img', { name: 'Master' })).toBeInTheDocument();
    });

    // dom-accessibility-api falls back to an SVG's <title> when aria-labelledby dangles,
    // so getByRole({ name }) passes under jsdom on markup that fails on real AT.
    it('points every aria-labelledby at a title that exists and is unique', async () => {
        render(<CreditCardIconList cardTypes={['discover', 'electron', 'troy']} />);

        const icons = await screen.findAllByRole('img');

        expect(icons).toHaveLength(3);

        icons.forEach((icon) => {
            const titleId = icon.getAttribute('aria-labelledby') ?? '';
            const titles = document.querySelectorAll(`[id="${titleId}"]`);

            expect(titles).toHaveLength(1);
            expect(icon.contains(titles[0])).toBe(true);
        });
    });

    it('renders nothing if no cards have icon', () => {
        render(<CreditCardIconList cardTypes={['foo', 'bar']} />);

        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    describe('with maxVisibleCardTypes', () => {
        const cardTypes = ['american-express', 'visa', 'discover', 'mastercard', 'jcb'];
        const moreCardsLabel = 'Show more accepted cards';

        it('shows the first cards inline and the rest behind a +N chip', () => {
            render(
                <CreditCardIconList
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

        it('lists the remaining cards in the tooltip on click', async () => {
            render(
                <CreditCardIconList
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

        it('does not render a chip when all cards fit', () => {
            render(
                <CreditCardIconList cardTypes={['visa', 'mastercard']} maxVisibleCardTypes={2} />,
            );

            expect(screen.getAllByRole('listitem')).toHaveLength(2);
            expect(screen.queryByTestId('credit-card-overflow')).not.toBeInTheDocument();
        });

        it('keeps the detected card visible so it can be highlighted', () => {
            const { container } = render(
                <CreditCardIconList
                    cardTypes={cardTypes}
                    maxVisibleCardTypes={2}
                    selectedCardType="jcb"
                />,
            );

            expect(screen.getByTestId('jcb-icon')).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container
            expect(container.getElementsByClassName('is-active')).toHaveLength(1);
            expect(screen.getByText('+2')).toBeInTheDocument();
        });
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
