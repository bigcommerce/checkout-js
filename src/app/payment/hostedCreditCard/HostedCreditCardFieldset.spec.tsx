import { mount } from 'enzyme';
import { Field, Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import HostedCreditCardCodeField from './HostedCreditCardCodeField';
import HostedCreditCardExpiryField from './HostedCreditCardExpiryField';
import HostedCreditCardFieldset, { HostedCreditCardFieldsetProps } from './HostedCreditCardFieldset';
import HostedCreditCardNameField from './HostedCreditCardNameField';
import HostedCreditCardNumberField from './HostedCreditCardNumberField';

/* eslint-disable react/jsx-no-bind */
describe('HostedCreditCardFieldset', () => {
    let defaultProps: HostedCreditCardFieldsetProps;
    let HostedCreditCardFieldsetTest: FunctionComponent<HostedCreditCardFieldsetProps>;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'cardExpiry',
            cardNumberId: 'cardNumber',
        };

        HostedCreditCardFieldsetTest = props => (
            <Formik
                initialValues={ { hostedForm: {} } }
                onSubmit={ noop }
                render={ () => <HostedCreditCardFieldset { ...props } /> }
            />
        );
    });

    it('renders required field containers', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest { ...defaultProps } />
        );

        expect(component.find(HostedCreditCardNumberField).length)
            .toEqual(1);

        expect(component.find(HostedCreditCardExpiryField).length)
            .toEqual(1);
    });

    it('renders optional field containers', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                { ...defaultProps }
                cardCodeId="cardCode"
                cardNameId="cardName"
            />
        );

        expect(component.find(HostedCreditCardCodeField).length)
            .toEqual(1);

        expect(component.find(HostedCreditCardNameField).length)
            .toEqual(1);
    });

    it('shows the "save card" and "make default" inputs if configured', () => {
        const container = mount(
            <HostedCreditCardFieldsetTest
                { ...defaultProps }
                shouldShowSaveCardField
            />
        );

        expect(container.find('input[name="shouldSaveInstrument"]').exists())
            .toBe(true);

        expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(true);
    });

    it('does not show the "save card" and "make default" inputs by default', () => {
        const container = mount(
            <HostedCreditCardFieldsetTest { ...defaultProps } />
        );

        expect(container.find('input[name="shouldSaveInstrument"]').exists())
            .toBe(false);

        expect(container.find('input[name="shouldSetAsDefaultInstrument"]').exists())
            .toBe(false);
    });

    it('renders additional fields if provided', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                { ...defaultProps }
                additionalFields={ <Field name="foobar" /> }
            />
        );

        expect(component.find('input[name="foobar"]').length)
            .toEqual(1);
    });

    it('renders field container with focus styles', () => {
        const component = mount(
            <HostedCreditCardFieldsetTest
                { ...defaultProps }
                focusedFieldType="cardNumber"
            />
        );

        expect(component.find('TextInputIframeContainer[id="cardNumber"]').prop('appearFocused'))
            .toBeTruthy();
    });
});
/* eslint-enable react/jsx-no-bind */
