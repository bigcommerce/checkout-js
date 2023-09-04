import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import PrivacyPolicyField from './PrivacyPolicyField';

describe('PrivacyPolicyField', () => {
    let localeContext: LocaleContextType;
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('renders checkbox with external link', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <PrivacyPolicyField isExpressPrivacyPolicy={false} url="foo" />
                </Formik>
            </LocaleContext.Provider>,
        );

        const link = screen.getByText('privacy policy');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'foo');

        expect(screen.getByTestId('privacy-policy-checkbox')).toBeInTheDocument();
        expect(screen.getByLabelText('Yes, I agree with the privacy policy.')).toBeInTheDocument();
    });

    it('renders text with external link if isExpressPrivacyPolicy is true', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <PrivacyPolicyField isExpressPrivacyPolicy={true} url="foo" />
                </Formik>
            </LocaleContext.Provider>,
        );

        const link = screen.getByText('privacy policy');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'foo');

        expect(screen.getByText('By clicking continue', { exact: false })).toBeInTheDocument();
    });
});
