import { type CheckoutSelectors, type CheckoutService, createCheckoutService, type CurrencyService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import StoreCreditField, { type StoreCreditFieldProps } from './StoreCreditField';

interface StoreCreditFieldTestProps extends StoreCreditFieldProps {
    isSubmittingOrder?: boolean;
}

describe('StoreCreditField', () => {
    let localeContext: Required<LocaleContextType>;
    let currencyService: CurrencyService;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    const StoreCreditFieldTest = ({ isSubmittingOrder = false, ...props }: StoreCreditFieldTestProps) => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.statuses, 'isSubmittingOrder').mockReturnValue(isSubmittingOrder);

        return  (
            <LocaleContext.Provider value={localeContext}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <Formik initialValues={{ useStoreCredit: true }} onSubmit={noop}>
                        <StoreCreditField {...props} />
                    </Formik>
                </CheckoutContext.Provider>
            </LocaleContext.Provider>
        );
    };

    it('renders form field with available store credit as label', () => {
        render(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                usableStoreCredit={100}
            />,
        );

        expect(screen.getByText(/Apply/)).toBeInTheDocument();
        expect(screen.getByText(currencyService.toCustomerCurrency(100))).toBeInTheDocument();
        expect(screen.getByText(/store credit to order/)).toBeInTheDocument();
    });

    it('renders field input as checkbox', () => {
        render(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                usableStoreCredit={100}
            />,
        );

        expect(screen.getByRole('checkbox', { name: 'Apply $112.00 store credit to order' })).toBeInTheDocument();
    });

    it('notifies parent when value changes', async () => {
        const handleChange = jest.fn();

        render(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                onChange={handleChange}
                usableStoreCredit={100}
            />,
        );

        await userEvent.click(screen.getByRole('checkbox', { name: 'Apply $112.00 store credit to order' }));

        expect(handleChange).toHaveBeenCalled();
    });

    it('checkbox should be disabled while order is submiting', async () => {
        const handleChange = jest.fn();

        render(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                isSubmittingOrder={true}
                name="useStoreCredit"
                onChange={handleChange}
                usableStoreCredit={100}
            />,
        );

        expect(screen.getByRole('checkbox', { name: 'Apply $112.00 store credit to order' })).toBeDisabled();
    });
});
