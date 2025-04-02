import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { CreditCardFieldset } from './';

describe('CreditCardFieldset', () => {
    it('shows card code field when configured', () => {
        const initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
        };
        const localeContext = createLocaleContext(getStoreConfig());

        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardFieldset
                        shouldShowCardCodeField={true}
                        shouldShowCustomerCodeField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByRole('textbox', { name: 'Credit Card Number' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Expiration' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name on Card' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'CVV' })).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: 'Customer Code (Optional)' }),
        ).toBeInTheDocument();
    });
});
