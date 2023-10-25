import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import { LocaleProvider } from '@bigcommerce/checkout/locale';

import { MandateTextComponent, MandateTextComponentProps } from './MandateTextComponent';
import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';

describe('MandateTextComponent',  () => {
    let MandateTextComponentTest: FunctionComponent<MandateTextComponentProps>;
    let checkoutService: CheckoutService;
    let props: MandateTextComponentProps;

    beforeEach(() => {
        props = {
            mandateText: {
                account_holder_name: 'Test',
                iban: '1343442323',
                payment_reference: 'GDU856858',
            },
            methodId: 'ratepay',
            providerId: 'paypalcommercealternativemethod'
        };
        checkoutService = createCheckoutService();

        MandateTextComponentTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <MandateTextComponent {...props}/>
            </LocaleProvider>
        )
    });

    it('do not render component if mandateText is empty', () => {
        const props = {
            mandateText: {},
            methodId: 'ratepay',
            providerId: 'paypalcommercealternativemethod'
        };

        render(<MandateTextComponentTest {...props}/>);

        const list = screen.queryAllByRole('list');

        expect(list.length).toEqual(0);
    });

    it('renders proper count of li', async () => {
        render(<MandateTextComponentTest {...props}/>);
        const items = await screen.findAllByRole('listitem');

        expect(items.length).toEqual(3);
    });

    it('renders proper translation keys and values', async () => {
        const expectedFirstListItemKey = 'optimized_checkout.order_confirmation.mandate.paypalcommercealternativemethod.ratepay.account_holder_name';
        const expectedSecondListItemKey = 'optimized_checkout.order_confirmation.mandate.paypalcommercealternativemethod.ratepay.iban';
        const expectedThirdListItemKey = 'optimized_checkout.order_confirmation.mandate.paypalcommercealternativemethod.ratepay.payment_reference';
        render(<MandateTextComponentTest {...props}/>);

        // First li
        const firstItem = await screen.findByTestId('order-confirmation-mandate-text-list-item-0');
        const firstItemKey = firstItem?.textContent?.split(':')[0];
        const firstItemValue =  firstItem?.textContent?.split(':')[1];

        // Second li
        const secondItem = await screen.findByTestId('order-confirmation-mandate-text-list-item-1');
        const secondItemKey = secondItem?.textContent?.split(':')[0];
        const secondItemValue =  secondItem?.textContent?.split(':')[1];

        // Third li
        const thirdItem = await screen.findByTestId('order-confirmation-mandate-text-list-item-2');
        const thirdItemKey = thirdItem?.textContent?.split(':')[0];
        const thirdItemValue =  thirdItem?.textContent?.split(':')[1]

        expect(firstItemKey).toEqual(expectedFirstListItemKey);
        expect(secondItemKey).toEqual(expectedSecondListItemKey);
        expect(thirdItemKey).toEqual(expectedThirdListItemKey);

        expect(firstItemValue).toEqual(' Test');
        expect(secondItemValue).toEqual(' 1343442323');
        expect(thirdItemValue).toEqual(' GDU856858');
    });
});
