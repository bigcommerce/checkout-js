import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';
import { B2BPaymentFieldsSessionStorage } from '@bigcommerce/checkout/utility';

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

        expect(
            B2BPaymentFieldsSessionStorage.get(B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY),
        ).toBe('hello world');
    });

    it('removes the key from session storage when the field is cleared', () => {
        sessionStorage.setItem(B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY, 'existing');
        renderField('existing');

        fireEvent.change(screen.getByTestId('invoicePaymentComment-input'), {
            target: { value: '' },
        });

        expect(
            sessionStorage.getItem(B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY),
        ).toBeNull();
    });
});
