import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import AdditionalPaymentField from './AdditionalPaymentField';

describe('AdditionalPaymentField', () => {
    const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

    const renderField = (
        { label = 'Notes', isRequired = false }: { label?: string; isRequired?: boolean } = {},
        initialValue = '',
    ) =>
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ additionalPaymentField: initialValue }} onSubmit={noop}>
                    <AdditionalPaymentField isRequired={isRequired} label={label} />
                </Formik>
            </LocaleContext.Provider>,
        );

    it('renders the provided label and an input', () => {
        renderField({ label: 'Delivery instructions' });

        expect(screen.getByText('Delivery instructions')).toBeInTheDocument();
        expect(screen.getByTestId('additionalPaymentField-input')).toBeInTheDocument();
    });

    it('shows the optional hint when isRequired is false', () => {
        renderField({ isRequired: false });

        expect(
            screen.getByText(localeContext.language.translate('common.optional_text')),
        ).toBeInTheDocument();
    });

    it('does not show the optional hint when isRequired is true', () => {
        renderField({ isRequired: true });

        expect(
            screen.queryByText(localeContext.language.translate('common.optional_text')),
        ).not.toBeInTheDocument();
    });

    it('updates the field value on change', () => {
        renderField();

        fireEvent.change(screen.getByTestId('additionalPaymentField-input'), {
            target: { value: 'leave at front door' },
        });

        expect(screen.getByDisplayValue('leave at front door')).toBeInTheDocument();
    });
});
