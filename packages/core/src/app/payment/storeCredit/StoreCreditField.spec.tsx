import { CurrencyService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';

import StoreCreditField, { StoreCreditFieldProps } from './StoreCreditField';

describe('StoreCreditField', () => {
    let localeContext: Required<LocaleContextType>;
    let currencyService: CurrencyService;
    let StoreCreditFieldTest: FunctionComponent<StoreCreditFieldProps>;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;

        StoreCreditFieldTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={{ useStoreCredit: true }} onSubmit={noop}>
                    <StoreCreditField {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('renders form field with available store credit as label', () => {
        const component = mount(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                usableStoreCredit={100}
            />,
        );

        expect(component.find('label[htmlFor="useStoreCredit"]').text()).toBe(
            `Apply ${currencyService.toCustomerCurrency(100)} store credit to order`,
        );
    });

    it('renders field input as checkbox', () => {
        const component = mount(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                usableStoreCredit={100}
            />,
        );

        expect(component.find('input').props()).toEqual(
            expect.objectContaining({
                name: 'useStoreCredit',
                checked: true,
                type: 'checkbox',
            }),
        );
    });

    it('notifies parent when value changes', () => {
        const handleChange = jest.fn();
        const component = mount(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                name="useStoreCredit"
                onChange={handleChange}
                usableStoreCredit={100}
            />,
        );

        component
            .find('input[name="useStoreCredit"]')
            .simulate('change', { target: { checked: false, name: 'useStoreCredit' } });

        expect(handleChange).toHaveBeenCalled();
    });
});
