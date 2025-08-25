import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import HostedCreditCardValidation, {
    type HostedCreditCardValidationProps,
} from './HostedCreditCardValidation';

describe('HostedCreditCardValidation', () => {
    let HostedCreditCardValidationTest: FunctionComponent<HostedCreditCardValidationProps>;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());

        HostedCreditCardValidationTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{}} onSubmit={noop}>
                    <HostedCreditCardValidation {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('shows card number field if configured', () => {
        render(<HostedCreditCardValidationTest cardNumberId="cardNumber" />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_number_label')),
        ).toBeInTheDocument();
    });

    it('hides card number field if configured', () => {
        render(<HostedCreditCardValidationTest cardCodeId="cardCode" />);

        expect(
            screen.queryByText(
                localeContext.language.translate('payment.credit_card_number_label'),
            ),
        ).not.toBeInTheDocument();
    });

    it('shows card code field if configured', () => {
        render(<HostedCreditCardValidationTest cardCodeId="cardCode" />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_cvv_label')),
        ).toBeInTheDocument();
    });

    it('hides card code field if configured', () => {
        render(<HostedCreditCardValidationTest cardNumberId="cardNumber" />);

        expect(
            screen.queryByText(localeContext.language.translate('payment.credit_card_cvv_label')),
        ).not.toBeInTheDocument();
    });

    it('shows card expiry field if configured', () => {
        render(<HostedCreditCardValidationTest cardExpiryId="cardExpiry" />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_expiration_label')),
        ).toBeInTheDocument();
    });

    it('hides card expiry field if configured', () => {
        render(<HostedCreditCardValidationTest cardNumberId="cardCode" />);

        expect(
            screen.queryByText(localeContext.language.translate('payment.credit_card_expiration_label')),
        ).not.toBeInTheDocument();
    });
});
