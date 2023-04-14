import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
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

describe('BraintreeAchPaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: BraintreeAchPaymentFormProps;
    let BraintreeAchPaymentFormTest: FunctionComponent<BraintreeAchPaymentFormProps>;
    let paymentForm: PaymentFormService;
    let initialValues: FormikValues;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        const { language } = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: getBraintreeAchPaymentMethod(),
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            mandateText: 'default',
        };

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

    // TODO:: add test for OwnershipTypes.Business
    it('should only contain formFields for OwnershipTypes.Personal', () => {
        const container = mount(<BraintreeAchPaymentFormTest {...defaultProps} />);

        expect(container.find(AchFormFields).prop('fieldValues')).not.toContain({
            name: BraintreeAchBankAccountValues.BusinessName,
        });
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
});
