import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils'

import { getStoreConfig } from '../../config/config.mock';

import CreditCardFieldset from './CreditCardFieldset';

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
                    <CreditCardFieldset shouldShowCardCodeField={true} shouldShowCustomerCodeField={true}/>
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByRole('textbox', { name: 'Credit Card Number' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Expiration' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name on Card' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'CVV' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Customer Code (Optional)' })).toBeInTheDocument();
    });
});
