import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React, { FunctionComponent } from 'react';
import '@testing-library/jest-dom';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import LocaleContext, { LocaleContextType } from './LocaleContext';
import LocaleProvider from './LocaleProvider';

describe('LocaleProvider', () => {
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('components wrapped in locale context have access to translate method', () => {
        const Child: FunctionComponent<LocaleContextType> = ({ language }) => (
            <>{language && language.translate('billing.billing_heading')}</>
        );

        render(
            <LocaleProvider checkoutService={checkoutService}>
                <LocaleContext.Consumer>
                    {(props) => props && <Child {...props} />}
                </LocaleContext.Consumer>
            </LocaleProvider>,
        );

        expect(screen.getByText('Billing')).toBeInTheDocument();
    });
});
