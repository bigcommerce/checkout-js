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
