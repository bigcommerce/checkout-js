import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    LineItemMap,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getFormFields } from '../address/formField.mock';
import { getCart } from '../cart/carts.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import { getCountries } from '../geography/countries.mock';
import { OrderComments } from '../orderComments';

import Billing, { BillingProps } from './Billing';
import { getBillingAddress } from './billingAddresses.mock';
import BillingForm from './BillingForm';

describe('Billing Component', () => {
    let component: ReactWrapper;
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let defaultProps: BillingProps;
    let ComponentTest: FunctionComponent<BillingProps>;
    const billingAddress = {
        ...getBillingAddress(),
        firstName: 'foo',
    };

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        defaultProps = {
            navigateNextStep: jest.fn(),
            onReady: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService.getState().data, 'getBillingAddressFields').mockReturnValue(
            getFormFields(),
        );

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutService.getState().data, 'getBillingCountries').mockReturnValue(
            getCountries(),
        );

        jest.spyOn(checkoutService.getState().statuses, 'isUpdatingBillingAddress').mockReturnValue(
            false,
        );

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
            billingAddress,
        );

        jest.spyOn(checkoutService, 'updateBillingAddress').mockResolvedValue(
            {} as CheckoutSelectors,
        );
        jest.spyOn(checkoutService, 'updateCheckout').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        ComponentTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Billing {...props} />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    beforeEach(async () => {
        component = mount(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));
    });

    it('loads billing fields', () => {
        expect(checkoutService.loadBillingAddressFields).toHaveBeenCalled();
    });

    it('triggers callback when billing fields are loaded', () => {
        expect(defaultProps.onReady).toHaveBeenCalled();
    });

    it('renders header', () => {
        expect(component.find('[data-test="billing-address-heading"]').text()).toBe(
            'Billing Address',
        );
    });

    it('does not render order comments when there are physical items', () => {
        expect(component.find(OrderComments)).toHaveLength(0);
    });

    it('renders order comments when there are no physical items', () => {
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: { physicalItems: [] } as unknown as LineItemMap,
        });

        component = mount(<ComponentTest {...defaultProps} />);

        expect(component.find(OrderComments)).toHaveLength(1);
    });

    it('updates order comment when input value does not match state value', async () => {
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: { physicalItems: [] } as unknown as LineItemMap,
        });

        component = mount(<ComponentTest {...defaultProps} />);

        component
            .find('input[name="orderComment"]')
            .simulate('change', { target: { value: 'foo', name: 'orderComment' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateCheckout).toHaveBeenCalledWith({ customerMessage: 'foo' });
        expect(defaultProps.navigateNextStep).toHaveBeenCalled();
    });

    it('does not render BillingForm while loading billing countries', () => {
        jest.spyOn(
            checkoutService.getState().statuses,
            'isLoadingBillingCountries',
        ).mockReturnValue(true);

        component = mount(<ComponentTest {...defaultProps} />);

        expect(component.find(BillingForm)).toHaveLength(0);
    });

    it('renders BillingForm with expected props', () => {
        expect(component.find(BillingForm).props()).toEqual(
            expect.objectContaining({
                billingAddress,
                customer: getCustomer(),
                countries: getCountries(),
            }),
        );
    });

    it('calls updateBillingAddress and navigateNextStep when form is submitted and valid', async () => {
        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).toHaveBeenCalledWith({
            address1: '12345 Testing Way',
            address2: '',
            customFields: [
                { fieldId: 'field_25', fieldValue: '' },
                { fieldId: 'field_27', fieldValue: '' },
                { fieldId: 'field_31', fieldValue: '' },
            ],
            stateOrProvince: '',
            stateOrProvinceCode: '',
            firstName: 'foo',
            lastName: 'Tester',
            shouldSaveAddress: true,
        });

        expect(defaultProps.navigateNextStep).toHaveBeenCalled();
    });

    it('calls unhandled error handler when there is error that is not handled by component', async () => {
        const error = new Error();

        jest.spyOn(checkoutService, 'updateBillingAddress').mockRejectedValue(error);

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(error);
    });

    it('calls onUnhandledError if onReady was failed', async () => {
        defaultProps.onReady = jest.fn(() => {
            throw new Error();
        });

        component = mount(<ComponentTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });
});
