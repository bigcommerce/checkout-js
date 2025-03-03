import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import ShippingOptionAdditionalDescription from './ShippingOptionAdditionalDescription';

describe('ShippingOptionAdditionalDescription Component', () => {
    const checkoutService = createCheckoutService();

    it('renders additional description', () => {
        render(<LocaleProvider checkoutService={checkoutService}><ShippingOptionAdditionalDescription description="Test this" /></LocaleProvider>);

        expect(screen.getByText('Test this')).toBeInTheDocument();
    });

    it('renders additional description', async () => {
        const longDescription = 'This is a really long description, it just goes on and on and on';

        render(
            <LocaleProvider checkoutService={checkoutService}><ShippingOptionAdditionalDescription
                description={longDescription}/></LocaleProvider>,
        );

        expect(screen.getByText(longDescription)).toHaveClass('shippingOption-additionalDescription--collapsed');

        await userEvent.click(screen.getByText('Show more'));

        expect(screen.getByText(longDescription)).toHaveClass('shippingOption-additionalDescription--expanded');
    });
});
