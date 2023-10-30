import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { mount } from 'enzyme';
import { Field, Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardExpiryField from './HostedCreditCardExpiryField';
import HostedCreditCardFieldset, {
    HostedCreditCardFieldsetProps,
} from './HostedCreditCardFieldset';
import HostedCreditCardNameField from './HostedCreditCardNameField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';

describe('HostedCreditCardFieldset', () => {
    let defaultProps: HostedCreditCardFieldsetProps;
    let HostedCreditCardFieldsetTest: FunctionComponent<HostedCreditCardFieldsetProps>;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'cardExpiry',
            cardNumberId: 'cardNumber',
        };

        const checkoutService = createCheckoutService();

        HostedCreditCardFieldsetTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <Formik
                    initialValues={{ hostedForm: {} }}
                    onSubmit={noop}
                    render={() => <HostedCreditCardFieldset {...props} />}
                />
            </LocaleProvider>
        );
    });

    it('renders required field containers', () => {
        const component = mount(<HostedCreditCardFieldsetTest {...defaultProps} />);

        expect(component.find(HostedCreditCardNumberField)).toHaveLength(1);

        expect(component.find(HostedCreditCardExpiryField)).toHaveLength(1);
    });

    it('renders optional field containers', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                {...defaultProps}
                cardCodeId="cardCode"
                cardNameId="cardName"
            />,
        );

        expect(component.find(HostedCreditCardCodeField)).toHaveLength(1);

        expect(component.find(HostedCreditCardNameField)).toHaveLength(1);
    });

    it('renders additional fields if provided', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                {...defaultProps}
                additionalFields={<Field name="foobar" />}
            />,
        );

        expect(component.find('input[name="foobar"]')).toHaveLength(1);
    });

    it('renders field container with focus styles', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest {...defaultProps} focusedFieldType="cardNumber" />,
        );

        expect(
            component.find('TextInputIframeContainer[id="cardNumber"]').prop('appearFocused'),
        ).toBeTruthy();
    });
});
/* eslint-enable react/jsx-no-bind */
