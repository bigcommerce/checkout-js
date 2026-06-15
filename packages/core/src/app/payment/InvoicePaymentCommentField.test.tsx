import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { getStoreConfig } from '../config/config.mock';

import InvoicePaymentCommentField from './InvoicePaymentCommentField';

describe('InvoicePaymentCommentField', () => {
    const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

    const renderField = (initialValue = '') =>
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ invoicePaymentComment: initialValue }} onSubmit={noop}>
                    <InvoicePaymentCommentField />
                </Formik>
            </LocaleContext.Provider>,
        );

    beforeEach(() => {
        sessionStorage.clear();
    });

    it('renders a textarea labeled "Payment comment"', () => {
        renderField();

        expect(screen.getByText('Payment comment')).toBeInTheDocument();
        expect(screen.getByTestId('invoicePaymentComment-input')).toBeInTheDocument();
    });

    it('writes the typed value to session storage on change', () => {
        renderField();

        fireEvent.change(screen.getByTestId('invoicePaymentComment-input'), {
            target: { value: 'hello world' },
        });

        expect(B2BSessionStorage.getValue(B2BSessionStorage.invoiceCommentKey)).toBe('hello world');
    });

    it('stores an empty value when the field is cleared', () => {
        B2BSessionStorage.set(B2BSessionStorage.invoiceCommentKey, 'existing');
        renderField('existing');

        fireEvent.change(screen.getByTestId('invoicePaymentComment-input'), {
            target: { value: '' },
        });

        expect(B2BSessionStorage.getValue(B2BSessionStorage.invoiceCommentKey)).toBe('');
    });
});
