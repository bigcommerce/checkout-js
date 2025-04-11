import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import TermsConditionsField, { TermsConditionsType } from './TermsConditionsField';

describe('TermsConditionsField', () => {
    const localeContext = createLocaleContext(getStoreConfig());
    const translate = localeContext.language.translate;
    const initialValues = { terms: false };
    const terms = 'Hello world';

    it('renders terms and conditions checkbox with link if type is "modal"', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        terms="Hello world"
                        type={TermsConditionsType.Modal}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText(translate('terms_and_conditions.terms_and_conditions_heading'))).toBeInTheDocument();
        expect(screen.getByText(/I agree/)).toBeInTheDocument();

        await userEvent.click(screen.getByText('terms and conditions'));

        expect(screen.getByText(terms)).toBeInTheDocument();
    });

    it('renders terms and conditions checkbox with link if type is "text"', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        terms={terms}
                        type={TermsConditionsType.TextArea}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByText(translate('terms_and_conditions.terms_and_conditions_heading'))).toBeInTheDocument();
        expect(screen.getByText(/I agree/)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveTextContent(terms);
    });

    it('renders terms and conditions checkbox with link if type is "url"', () => {
        const termURL = 'https://www.example.com/terms-and-conditions';

        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <TermsConditionsField
                        name="terms"
                        type={TermsConditionsType.Link}
                        url={termURL}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        const link = screen.getByRole('link', { name: /terms and conditions/i });

        expect(link).toHaveAttribute('href', termURL);
    });
});
