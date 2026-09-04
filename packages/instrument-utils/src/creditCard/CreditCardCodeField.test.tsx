import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';
import { FormContext } from '@bigcommerce/checkout/ui';

import CreditCardCodeField from './CreditCardCodeField';

describe('CreditCardCodeField', () => {
    const renderField = () => {
        const localeContext = createLocaleContext(getStoreConfig());

        return render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ ccCvv: '' }} onSubmit={noop}>
                    <CreditCardCodeField name="ccCvv" />
                </Formik>
            </LocaleContext.Provider>,
        );
    };

    const renderFieldWithError = () => {
        const localeContext = createLocaleContext(getStoreConfig());

        return render(
            <LocaleContext.Provider value={localeContext}>
                <FormContext.Provider value={{ isSubmitted: true, setSubmitted: noop }}>
                    <Formik
                        initialErrors={{ ccCvv: 'CVV must be valid' }}
                        initialTouched={{ ccCvv: true }}
                        initialValues={{ ccCvv: '' }}
                        onSubmit={noop}
                    >
                        <CreditCardCodeField name="ccCvv" />
                    </Formik>
                </FormContext.Provider>
            </LocaleContext.Provider>,
        );
    };

    it('renders the help tooltip trigger as a named button', () => {
        renderField();

        expect(screen.getByRole('button', { name: 'What is a CVV?' })).toBeInTheDocument();
    });

    it('shows the tooltip when the trigger is focused by keyboard', async () => {
        renderField();

        await userEvent.tab();

        expect(screen.getByRole('button', { name: 'What is a CVV?' })).toHaveFocus();
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('dismisses the tooltip on Escape without moving focus', async () => {
        renderField();

        await userEvent.tab();
        await userEvent.keyboard('{Escape}');

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'What is a CVV?' })).toHaveFocus();
    });

    it('keeps focus on the trigger when it is clicked inside the label', async () => {
        renderField();

        const trigger = screen.getByRole('button', { name: 'What is a CVV?' });

        await userEvent.click(trigger);

        expect(trigger).toHaveFocus();
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('still exposes the validation error on the input', () => {
        renderFieldWithError();

        expect(screen.getByRole('textbox', { name: 'CVV' })).toHaveAccessibleDescription(
            'CVV must be valid',
        );
    });

    it('keeps the input accessible name as the label text while the tooltip is open', async () => {
        renderField();

        await userEvent.tab();

        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'CVV' })).toBeInTheDocument();
    });
});
