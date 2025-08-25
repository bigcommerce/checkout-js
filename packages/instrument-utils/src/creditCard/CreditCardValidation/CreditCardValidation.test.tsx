import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { CreditCardValidation } from './';

describe('CreditCardValidation', () => {
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('shows card number field if configured', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(
            screen.getByText('Please re-enter your card number to authorize this transaction.'),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('CVV')).toBeInTheDocument();
        expect(screen.getByLabelText('Credit Card Number')).toBeInTheDocument();
    });

    it('hides card number field if configured', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={false}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.queryByLabelText('Credit Card Number')).not.toBeInTheDocument();
    });

    it('shows card code field if configured', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={true}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.getByLabelText('CVV')).toBeInTheDocument();
        expect(screen.getByLabelText('Credit Card Number')).toBeInTheDocument();
    });

    it('hides card code field if configured', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <CreditCardValidation
                        shouldShowCardCodeField={false}
                        shouldShowNumberField={true}
                    />
                </Formik>
            </LocaleContext.Provider>,
        );

        expect(screen.queryByLabelText('CVV')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Credit Card Number')).toBeInTheDocument();
    });
});
