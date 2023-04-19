import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';

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

    it('allows user to type in potentially valid number', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        component
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '4111', name: 'ccNumber' } })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toBe('4111');
    });

    it('prevents user from typing invalid number', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        component
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: 'xxxx', name: 'ccNumber' } })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toBe('');
    });

    it('limits number of digits based on card type', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        // The number of digits for Visa card should not exceed 19 digits (plus 3 gaps)
        component
            .find('input[name="ccNumber"]')
            .simulate('change', {
                target: { value: '4111 1111 1111 1111111 999999', name: 'ccNumber' },
            })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toHaveLength(22);

        // The number of digits for Amex card should not exceed 15 digits (plus 2 gaps)
        component
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '3782 822463 10005 999999', name: 'ccNumber' } })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toHaveLength(17);
    });

    it('formats card number based on type', () => {
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        component
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '411111111111', name: 'ccNumber' } })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toBe('4111 1111 1111');

        component
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '378282246310005', name: 'ccNumber' } })
            .update();

        expect(component.find('input[name="ccNumber"]').prop('value')).toBe('3782 822463 10005');
    });

    it('only sets selection range if it has changed', () => {
        const ccNumber = '4111';
        const component = mount(
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ ...initialValues, ccNumber }} onSubmit={noop}>
                    <CreditCardNumberField name="ccNumber" />
                </Formik>
            </LocaleContext.Provider>,
        );

        const input = component.find('input[name="ccNumber"]');
        const inputNode = input.getDOMNode<HTMLInputElement>();

        inputNode.setSelectionRange(4, 4);
        jest.spyOn(inputNode, 'setSelectionRange');

        // Trigger a change event with the same value
        input.simulate('change', { target: { value: ccNumber, name: 'ccNumber' } }).update();

        expect(inputNode.setSelectionRange).toHaveBeenCalledTimes(0);
    });
});
