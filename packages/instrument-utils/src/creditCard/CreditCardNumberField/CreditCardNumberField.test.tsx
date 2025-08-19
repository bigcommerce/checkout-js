import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { type CreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CreditCardNumberField from './CreditCardNumberField';

describe('CreditCardNumberField', () => {
    let initialValues: Pick<CreditCardFieldsetValues, 'ccNumber'>;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = {
            ccNumber: '',
        };

        localeContext = createLocaleContext(getStoreConfig());
    });

    it('allows user to type in potentially valid number', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText('Credit Card Number'), '4111');

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('4111');
    });

    it('prevents user from typing invalid number', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText('Credit Card Number'), 'xxxx');

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('');
    });

    it('limits number of digits based on card type', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        await userEvent.type(
            screen.getByLabelText('Credit Card Number'),
            '4111 1111 1111 1111111 999999',
        );

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('4111 1111 1111 1111111');

        await userEvent.clear(screen.getByLabelText('Credit Card Number'));
        await userEvent.type(
            screen.getByLabelText('Credit Card Number'),
            '3782 822463 10005 999999',
        );

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('3782 822463 10005');
    });

    it('formats card number based on type', async () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        await userEvent.type(screen.getByLabelText('Credit Card Number'), '411111111111');

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('4111 1111 1111');

        await userEvent.clear(screen.getByLabelText('Credit Card Number'));
        await userEvent.type(screen.getByLabelText('Credit Card Number'), '378282246310005');

        expect(screen.getByLabelText('Credit Card Number')).toHaveValue('3782 822463 10005');
    });
});
