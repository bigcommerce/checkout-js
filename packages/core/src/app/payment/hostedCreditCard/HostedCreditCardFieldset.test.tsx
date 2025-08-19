import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { Field, Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { createLocaleContext, type LocaleContextType, LocaleProvider } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardExpiryField from './HostedCreditCardExpiryField';
import HostedCreditCardFieldset, {
    type HostedCreditCardFieldsetProps,
} from './HostedCreditCardFieldset';
import HostedCreditCardNameField from './HostedCreditCardNameField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';

describe('HostedCreditCardFieldset', () => {
    let defaultProps: HostedCreditCardFieldsetProps;
    let HostedCreditCardFieldsetTest: FunctionComponent<HostedCreditCardFieldsetProps>;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'cardExpiry',
            cardNumberId: 'cardNumber',
        };

        const checkoutService = createCheckoutService();

        localeContext = createLocaleContext(getStoreConfig());

        HostedCreditCardFieldsetTest = (props) => (
            <LocaleProvider checkoutService={checkoutService} value={createLocaleContext(getStoreConfig())}>
                <Formik
                    initialValues={{ hostedForm: {} }}
                    onSubmit={noop}
                    render={() => <HostedCreditCardFieldset {...props} />}
                />
            </LocaleProvider>
        );
    });

    it('renders required field containers', () => {
        render(<HostedCreditCardFieldsetTest {...defaultProps} />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_text')),
        ).toBeInTheDocument();
        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_number_label')),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                localeContext.language.translate('payment.credit_card_expiration_label'),
            ),
        ).toBeInTheDocument();
    });

    it('renders optional field containers', () => {
        render(
            <HostedCreditCardFieldsetTest
                {...defaultProps}
                cardCodeId="cardCode"
                cardNameId="cardName"
            />,
        );
        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_number_label')),
        ).toBeInTheDocument();
        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_cvv_label')),
        ).toBeInTheDocument();
    });

    it('renders additional fields if provided', () => {
        render(
            <HostedCreditCardFieldsetTest
                {...defaultProps}
                additionalFields={<Field title="foobar" />}
            />,
        );

        expect(screen.getByRole('textbox', { name: 'foobar' })).toBeInTheDocument();
    });

    it('renders field container with focus styles', () => {
        const { container } = render(
            <HostedCreditCardFieldsetTest {...defaultProps} focusedFieldType="cardNumber" />,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.form-input--focus')).toBeInTheDocument();
    });
});
