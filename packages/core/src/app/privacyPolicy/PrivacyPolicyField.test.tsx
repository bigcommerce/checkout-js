import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import PrivacyPolicyField from './PrivacyPolicyField';

describe('PrivacyPolicyField', () => {
    let initialValues: { terms: boolean };

    beforeEach(() => {
        initialValues = { terms: false };
    });

    it('renders checkbox with external link', () => {
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <PrivacyPolicyField isExpressPrivacyPolicy={false} url="foo" />
            </Formik>,
        );

        const link = screen.getByText('privacy policy');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'foo');

        expect(screen.getByTestId('privacy-policy-checkbox')).toBeInTheDocument();
        expect(screen.getByLabelText('Yes, I agree with the privacy policy.')).toBeInTheDocument();
    });

    it('renders text with external link if isExpressPrivacyPolicy is true', () => {
        render(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <PrivacyPolicyField isExpressPrivacyPolicy={true} url="foo" />
            </Formik>,
        );

        const link = screen.getByText('privacy policy');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'foo');

        expect(screen.getByText('By clicking continue', { exact: false })).toBeInTheDocument();
    });
});
