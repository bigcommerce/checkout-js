import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    FormField,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { FormikValues } from 'formik/dist/types';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreeAchPaymentMethod,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { BraintreeAchBankAccountValues } from '../../validation-schemas';
import { AchFormFields } from '../AchFormFields';

import BraintreeAchPaymentForm, { BraintreeAchPaymentFormProps } from './BraintreeAchPaymentForm';
import { formFieldData, OwnershipTypes } from './braintreeAchPaymentFormConfig';

describe('BraintreeAchPaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: BraintreeAchPaymentFormProps;
    let BraintreeAchPaymentFormTest: FunctionComponent<BraintreeAchPaymentFormProps>;
    let paymentForm: PaymentFormService;
    let initialValues: FormikValues;

    let firstNameFormField: FormField | undefined;
    let lastNameFormField: FormField | undefined;
    let businessFormField: FormField | undefined;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        const { language } = createLocaleContext(getStoreConfig());

        firstNameFormField = formFieldData.find(
            ({ name }) => name === BraintreeAchBankAccountValues.FirstName,
        );

        lastNameFormField = formFieldData.find(
            ({ name }) => name === BraintreeAchBankAccountValues.FirstName,
        );

        businessFormField = formFieldData.find(
            ({ name }) => name === BraintreeAchBankAccountValues.BusinessName,
        );

        defaultProps = {
            method: getBraintreeAchPaymentMethod(),
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            setCurrentMandateText: jest.fn().mockReturnValue('mandate text'),
        };

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue({
            id: '55c96cda6f04c',
            firstName: 'Test',
            lastName: 'Tester',
            email: 'test@bigcommerce.com',
            company: 'Bigcommerce',
            address1: '12345 Testing Way',
            address2: '',
            city: 'Some City',
            stateOrProvince: 'California',
            stateOrProvinceCode: 'CA',
            country: 'United States',
            countryCode: 'US',
            postalCode: '95555',
            phone: '555-555-5555',
            customFields: [],
        });

        jest.spyOn(checkoutService.getState().data, 'getBillingCountries').mockReturnValue([
            {
                code: 'US',
                name: 'United States',
                hasPostalCodes: true,
                requiresState: true,
                subdivisions: [
                    { code: 'CA', name: 'California' },
                    { code: 'TX', name: 'Texas' },
                ],
            },
        ]);

        BraintreeAchPaymentFormTest = (props: BraintreeAchPaymentFormProps) => {
            return (
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                        <BraintreeAchPaymentForm {...props} />
                    </LocaleContext.Provider>
                </Formik>
            );
        };
    });

    it('should render form', () => {
        const container = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(container.find(BraintreeAchPaymentForm)).toHaveLength(1);
    });

    it('should only contain formFields for OwnershipTypes.Personal', () => {
        const eventData = {
            target: {
                value: OwnershipTypes.Personal,
                name: BraintreeAchBankAccountValues.OwnershipType,
            },
        };

        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((field) => {
            if (field === 'ownershipType') {
                return eventData.target.value;
            }
        });

        const container = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(container.find(AchFormFields).prop('fieldValues')).toContain(firstNameFormField);
        expect(container.find(AchFormFields).prop('fieldValues')).toContain(lastNameFormField);
        expect(container.find(AchFormFields).prop('fieldValues')).not.toContain(businessFormField);
    });

    it('should only contain formFields for OwnershipTypes.Business', () => {
        const eventData = {
            target: {
                value: OwnershipTypes.Business,
                name: BraintreeAchBankAccountValues.OwnershipType,
            },
        };

        jest.spyOn(paymentForm, 'getFieldValue').mockImplementation((field) => {
            if (field === 'ownershipType') {
                return eventData.target.value;
            }
        });

        const container = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        container.find('select[name="ownershipType"]').simulate('change', eventData);

        expect(paymentForm.setFieldValue).toHaveBeenCalledWith(
            eventData.target.name,
            eventData.target.value,
        );

        expect(container.find(AchFormFields).prop('fieldValues')).toContain(businessFormField);
        expect(container.find(AchFormFields).prop('fieldValues')).not.toContain(firstNameFormField);
        expect(container.find(AchFormFields).prop('fieldValues')).not.toContain(lastNameFormField);
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        jest.spyOn(checkoutState.statuses, 'isLoadingBillingCountries').mockReturnValue(true);

        component = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        jest.spyOn(checkoutState.statuses, 'isLoadingBillingCountries').mockReturnValue(false);

        component = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('hides content while loading', () => {
        const component = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading')).toBe(true);
    });

    it('mandateText should be hidden', () => {
        const component = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(component.find('.mandate-text')).toHaveLength(0);
    });

    it('mandateText should be visible', () => {
        const component = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        component.find('input[name="accountNumber"]').simulate('change', {
            target: { value: '1000000000', name: 'accountNumber' },
        });

        component.find('input[name="routingNumber"]').simulate('change', {
            target: { value: '011000015', name: 'routingNumber' },
        });

        expect(component.find('.mandate-text')).toHaveLength(0);
    });
});
