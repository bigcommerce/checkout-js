import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';

import HostedCreditCardNumberField, {
    type HostedCreditCardNumberFieldProps,
} from './HostedCreditCardNumberField';

describe('HostedCreditCardNumberField', () => {
    let HostedCreditCardNumberFieldTest: FunctionComponent<HostedCreditCardNumberFieldProps>;
    let defaultProps: HostedCreditCardNumberFieldProps;
    let initialValues: { ccNumber: string };
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = { ccNumber: '' };
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            appearFocused: true,
            id: 'ccNumber',
            name: 'ccNumber',
        };

        HostedCreditCardNumberFieldTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <HostedCreditCardNumberField {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('renders field with expected class name', () => {
        const { container } = render(<HostedCreditCardNumberFieldTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.form-field--ccNumber')).toBeInTheDocument();
    });

    it('renders field with expected label', () => {
        render(<HostedCreditCardNumberFieldTest {...defaultProps} />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_number_label')),
        ).toBeInTheDocument();
    });
});
