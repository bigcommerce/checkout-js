import { createCheckoutService, CheckoutService, FormField } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';
import { DynamicFormField } from '../ui/form';

import { getFormFields } from './formField.mock';
import AddressForm from './AddressForm';

describe('AddressForm Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let formFields: FormField[];

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        formFields = getFormFields();

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('renders all fields based on formFields', () => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <AddressForm
                        fieldName="address"
                        formFields={ formFields }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find('[name="address.shouldSaveAddress"]').exists())
            .toEqual(false);

        expect(component.find(DynamicFormField).length).toEqual(formFields.length);
    });

    it('renders DynamicFormField with expected props', () => {
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <AddressForm
                        fieldName="address"
                        formFields={ formFields }
                        shouldShowSaveAddress={ true }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.find(DynamicFormField).at(0).props()).toEqual(
            expect.objectContaining({
                parentFieldName: 'address',
                placeholder: undefined,
            })
        );

        expect(component.find('[name="address.shouldSaveAddress"]').exists())
            .toEqual(true);

        expect(component.find(DynamicFormField).at(0).prop('field')).toEqual(
            expect.objectContaining({
                id: 'field_14',
            })
        );

        expect(component.find(DynamicFormField).at(2).props().placeholder).toEqual('NO PO BOX');
    });

    it('renders calls onChange when a field is updated', () => {
        const onChange = jest.fn();

        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {
                        address1: 'foo',
                    } }
                    onSubmit={ noop }
                >
                    <AddressForm
                        formFields={ formFields }
                        onChange={ onChange }
                    />
                </Formik>
            </LocaleContext.Provider>
        );

        component.find('input[name="address1"]')
                .simulate('change', { target: { value: 'foo bar', name: 'address1' } });

        expect(onChange).toHaveBeenCalledWith('address1', 'foo bar');
    });

    it('renders the same dropdown menu with different field.default values', () => {
        const field = formFields.find(({ name }) => name === 'field_27') as FormFieldType;
        component = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <AddressForm formFields={ [field] } />
                </Formik>
            </LocaleContext.Provider>
        );
        const fieldChanged = {...field, default: 'new value'} as FormFieldType;
        const componentChanged = mount(
            <LocaleContext.Provider value={ localeContext }>
                <Formik
                    initialValues={ {} }
                    onSubmit={ noop }
                >
                    <AddressForm formFields={ [fieldChanged] } />
                </Formik>
            </LocaleContext.Provider>
        );

        expect(component.html()).toEqual(componentChanged.html());
    });
});
