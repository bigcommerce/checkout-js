import '@testing-library/jest-dom';
import React from 'react';

import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { getCardInstrument, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentMenuItem, {
    BraintreeAcceleratedCheckoutInstrumentMenuItemProps,
} from './BraintreeAcceleratedCheckoutInstrumentMenuItem';

describe('BraintreeAcceleratedCheckoutInstrumentMenuItem', () => {
    const localeContext = createLocaleContext(getStoreConfig());
    const instrument = getCardInstrument();
    const testId = 'menu-item-test-id';

    const renderInstrumentMenuItem = (props: BraintreeAcceleratedCheckoutInstrumentMenuItemProps) =>
        render(<BraintreeAcceleratedCheckoutInstrumentMenuItem {...props} />);

    it('shows instrument menu item button', () => {
        const view = renderInstrumentMenuItem({ instrument, testId });

        expect(view).toMatchSnapshot();
    });

    it('shows specific ending text for amex/diners/american_express card types', () => {
        const dinersInstrument = {
            ...instrument,
            brand: 'diners',
        };

        renderInstrumentMenuItem({ instrument: dinersInstrument, testId });

        expect(
            screen.getByText(
                localeContext.language.translate('payment.instrument_ending_in_text', {
                    cardTitle: 'Diners Club',
                    endingIn: dinersInstrument.last4,
                }),
            ),
        ).toBeInTheDocument();
    });

    it('highlights and shows the information that card is expired', () => {
        const expiredInstrument = {
            ...instrument,
            expiryMonth: '01',
            expiryYear: '2020',
        };

        renderInstrumentMenuItem({ instrument: expiredInstrument, testId });

        const messageContainer = screen.getByTestId(`${testId}-expiry`);

        expect(messageContainer).toHaveClass(
            'instrumentSelect-expiry instrumentSelect-expiry--expired',
        );
        expect(
            screen.getByText(
                localeContext.language.translate('payment.instrument_expired_text', {
                    expiryDate: `${expiredInstrument.expiryMonth}/${expiredInstrument.expiryYear}`,
                }),
            ),
        ).toBeInTheDocument();
    });
});
