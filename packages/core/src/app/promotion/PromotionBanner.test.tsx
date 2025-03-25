import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PromotionBanner from './PromotionBanner';

describe('PromotionBanner', () => {
    it('renders message as info alert', () => {
        const { container } = render(<PromotionBanner message="Hello world" />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.getElementsByClassName('alertBox--info')).toHaveLength(1);
    });

    it('renders alert message as HTML', () => {
        render(<PromotionBanner message="<strong>Hello world</strong>" />);

        expect(screen.getByTestId('promotion-banner-message').innerHTML).toBe(
            '<strong>Hello world</strong>',
        );
    });
});
