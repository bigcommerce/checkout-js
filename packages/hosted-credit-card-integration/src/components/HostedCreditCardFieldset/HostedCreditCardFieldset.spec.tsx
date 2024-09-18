import { mount } from 'enzyme';
import { Field, Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import {
    HostedCreditCardCodeField,
    HostedCreditCardExpiryField,
    HostedCreditCardNameField,
    HostedCreditCardNumberField,
} from '../';

import { HostedCreditCardFieldset, HostedCreditCardFieldsetProps } from '.';

describe('HostedCreditCardFieldset', () => {
    let defaultProps: HostedCreditCardFieldsetProps;
    let HostedCreditCardFieldsetTest: FunctionComponent<HostedCreditCardFieldsetProps>;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'cardExpiry',
            cardNumberId: 'cardNumber',
        };

        HostedCreditCardFieldsetTest = (props) => (
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <Formik
                    initialValues={{ hostedForm: {} }}
                    onSubmit={noop}
                    render={() => <HostedCreditCardFieldset {...props} />}
                />
            </LocaleContext.Provider>
        );
    });

    it('renders required field containers', () => {
        const component = mount(<HostedCreditCardFieldsetTest {...defaultProps} />);
        const formContainerClasses = component.find('.form-ccFields').prop('className');

        expect(component.find(HostedCreditCardNumberField)).toHaveLength(1);
        expect(component.find(HostedCreditCardExpiryField)).toHaveLength(1);
        expect(formContainerClasses).toContain('form-ccFields--without-card-name');
        expect(formContainerClasses).toContain('form-ccFields--without-card-code');
    });

    it('renders optional field containers', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                {...defaultProps}
                cardCodeId="cardCode"
                cardNameId="cardName"
            />,
        );
        const formContainerClasses = component.find('.form-ccFields').prop('className');

        expect(component.find(HostedCreditCardCodeField)).toHaveLength(1);
        expect(component.find(HostedCreditCardNameField)).toHaveLength(1);
        expect(formContainerClasses).not.toContain('form-ccFields--without-card-name');
        expect(formContainerClasses).not.toContain('form-ccFields--without-card-code');
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
        ).toBe(true);
    });
});
/* eslint-enable react/jsx-no-bind */
