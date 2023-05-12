import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { Modal } from '../ui/modal';

import AddressForm from './AddressForm';
import AddressFormModal, { AddressFormModalProps } from './AddressFormModal';
import { getFormFields } from './formField.mock';

describe('AddressFormModal Component', () => {
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let TestComponent: FunctionComponent<Partial<AddressFormModalProps>>;
    let defaultProps: AddressFormModalProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        defaultProps = {
            countriesWithAutocomplete: ['AU'],
            isLoading: false,
            isOpen: true,
            getFields: jest.fn(() => getFormFields()),
            onSaveAddress: jest.fn(),
            countries: [],
        };

        TestComponent = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AddressFormModal {...props} {...defaultProps} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders modal', () => {
        component = mount(<TestComponent />);

        expect(component.find(Modal).props()).toEqual(
            expect.objectContaining({
                isOpen: true,
                shouldShowCloseButton: true,
            }),
        );
    });

    it('renders address form', () => {
        component = mount(<TestComponent />);

        expect(component.find(AddressForm).props()).toEqual(
            expect.objectContaining({
                countries: defaultProps.countries,
                formFields: getFormFields(),
                shouldShowSaveAddress: false,
            }),
        );
    });

    it('validates form on submission', async () => {
        component = mount(<TestComponent />);

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(defaultProps.onSaveAddress).not.toHaveBeenCalled();

        expect(component.find('[data-test="first-name-field-error-message"]').text()).toBe(
            'First Name is required',
        );
    });

    it('submits form when valid', async () => {
        component = mount(<TestComponent />);

        component
            .find('input[name="firstName"]')
            .simulate('change', { target: { value: 'test', name: 'firstName' } });

        component
            .find('input[name="lastName"]')
            .simulate('change', { target: { value: 'foo', name: 'lastName' } });

        component
            .find('input[name="address1"]')
            .simulate('change', { target: { value: 'l1', name: 'address1' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(defaultProps.onSaveAddress).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'test',
                lastName: 'foo',
                address1: 'l1',
            }),
        );
    });
});
