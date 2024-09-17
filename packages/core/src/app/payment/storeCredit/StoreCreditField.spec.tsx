import { CheckoutSelectors, CheckoutService, createCheckoutService, CurrencyService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';

import StoreCreditField, { StoreCreditFieldProps } from './StoreCreditField';

interface StoreCreditFieldTestProps extends StoreCreditFieldProps {
    isSubmittingOrder?: boolean;
}

describe('StoreCreditField', () => {
    let localeContext: Required<LocaleContextType>;
    let currencyService: CurrencyService;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    const StoreCreditFieldTest = ({isSubmittingOrder = false, ...props}: StoreCreditFieldTestProps) => {
        localeContext = createLocaleContext(getStoreConfig());
        currencyService = localeContext.currency;
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.statuses, 'isSubmittingOrder').mockReturnValue(isSubmittingOrder);

        return  (
            <LocaleContext.Provider value={localeContext}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <Formik initialValues={{ useStoreCredit: true }} onSubmit={noop}>
                        <StoreCreditField {...props} />
                    </Formik>
                </CheckoutContext.Provider>
            </LocaleContext.Provider>
        );
    };

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

    it('checkbox should be disabled while order is submiting', async () => {
        const handleChange = jest.fn();

        const component = mount(
            <StoreCreditFieldTest
                availableStoreCredit={200}
                isStoreCreditApplied={true}
                isSubmittingOrder={true}
                name="useStoreCredit"
                onChange={handleChange}
                usableStoreCredit={100}
            />,
        );

        const checkboxElement = component.find('input[name="useStoreCredit"]');
        
        checkboxElement.simulate('click');
        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(checkboxElement.prop('disabled')).toBe(true);
        expect(handleChange).not.toHaveBeenCalled();
    });
});
