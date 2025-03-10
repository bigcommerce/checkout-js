import { createCheckoutService, StripeShippingEvent } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getAddressFormFields } from '../../address/formField.mock';
import CheckoutStepType from '../../checkout/CheckoutStepType';
import ConsoleErrorLogger from '../../common/error/ConsoleErrorLogger';
import { getStoreConfig } from '../../config/config.mock';
import { getShippingAddress } from '../shipping-addresses.mock';

import StripeShippingForm from './StripeShippingForm';



let hasSelectedShippingOptionsReturn = false;

jest.mock(
    '../hasSelectedShippingOptions',
    () => () => hasSelectedShippingOptionsReturn,
);

describe('StripeShippingForm', () => {
    const addressFormFields = getAddressFormFields().filter(({ custom }) => !custom);
    const checkoutService = createCheckoutService();
    const errorLogger = new ConsoleErrorLogger();
    const { customFields, ...rest } = getShippingAddress();
    const localeContext: LocaleContextType = createLocaleContext(getStoreConfig());

    const defaultProps = {
        isShippingMethodLoading: false,
        step: {
            isActive: true,
            isBusy: false,
            isComplete: false,
            isEditable: true,
            isRequired: true,
            type: CheckoutStepType.Shipping,
        },
        isBillingSameAsShipping: false,
        isInitialValueLoaded: false,
        isMultiShippingMode: false,
        countries: [],
        countriesWithAutocomplete: [],
        shippingAddress: rest,
        customerMessage: '',
        addresses: [],
        shouldShowOrderComments: true,
        consignments: [],
        cartHasChanged: false,
        isLoading: false,
        isShippingStepPending: false,
        onSubmit: jest.fn(),
        getFields: jest.fn(() => addressFormFields),
        onUnhandledError: jest.fn(),
        deinitialize: jest.fn(),
        signOut: jest.fn(),
        initialize: jest.fn(),
        updateAddress: jest.fn(),
        deleteConsignments: jest.fn(),
    };

   const renderContainer = (props = {}) => render(
     <CheckoutProvider checkoutService={checkoutService}>
         <LocaleContext.Provider value={localeContext}>
             <ExtensionProvider checkoutService={checkoutService} errorLogger={errorLogger}>
                 <StripeShippingForm {...defaultProps} {...props} />
             </ExtensionProvider>
         </LocaleContext.Provider>
     </CheckoutProvider>
     );

   afterEach(() => {
       jest.clearAllMocks();
   })

    it('renders form with a correct parameters', async () => {
        const { container } = renderContainer({ isLoading: false });

        expect(defaultProps.initialize).toHaveBeenCalled();
        expect(defaultProps.getFields).toHaveBeenCalledTimes(3);
        expect(defaultProps.getFields).toHaveBeenCalledWith("US");
        expect(container.querySelector('#StripeUpeShipping')).toBeInTheDocument();
    });

    it('disables submit button when loading', async () => {
       hasSelectedShippingOptionsReturn = true;
       renderContainer({ isLoading: true });

       const button = screen.getByRole('button', { name: /continue/i });

       expect(button).toBeInTheDocument();
       expect(button).toBeDisabled();
   })

    it('disables submit button if form is not valid', async () => {
        hasSelectedShippingOptionsReturn = true;

        renderContainer({ isValid: false, isLoading: false, shippingAddress: null });

        const button = screen.getByRole('button', { name: /continue/i });

        expect(button).toBeInTheDocument();

        if (button) {
            await userEvent.click(
                button,
            );

            expect(defaultProps.onSubmit).toHaveBeenCalledTimes(0);
        }
    })

    it('submits a form by clicking a button', async () => {
        hasSelectedShippingOptionsReturn = true;

        renderContainer();

        const button = screen.getByRole('button', { name: /continue/i });

        expect(button).toBeInTheDocument();

        if (button) {
           await userEvent.click(
                button,
            );

           expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
           expect(defaultProps.onSubmit).toHaveBeenCalledWith({
               billingSameAsShipping: false,
               orderComment: "",
               shippingAddress: { ...defaultProps.shippingAddress },
           });
        }
    })

    it('calls updateAddress correctly', async () => {
        const address = {
            line1: '12345 Testing',
            line2: 'Main str',
            city: 'City',
            state: 'State',
            country: 'United States',
            postal_code: '95545',
        }

        const shippingChangeEvent: StripeShippingEvent = {
            elementType: '',
            empty: false,
            complete: true,
            phoneFieldRequired: false,
            value: {
                phone: '555-444-5555',
                firstName: 'John',
                lastName: 'Doe',
                address,
            }
        }

        renderContainer({ isLoading: false });

        await act(async () => {
            const { stripeupe } = defaultProps.initialize.mock.calls[0][0];

            await stripeupe.onChangeShipping(shippingChangeEvent);
        });

        expect(defaultProps.updateAddress).toHaveBeenCalledWith({
            "address1": "12345 Testing",
            "address2": "Main str",
            "city": "City",
            "company": "",
            "country": "United States",
            "countryCode": "United States",
            "customFields": [],
            "firstName": "John",
            "lastName": "Doe",
            "phone": "555-444-5555",
            "postalCode": "95545",
            "shouldSaveAddress": true,
            "stateOrProvince": "State",
            "stateOrProvinceCode": "State",
        });
    });

    it('catches an error if something is wrong', async () => {
        defaultProps.updateAddress.mockRejectedValue(new Error('update failed'));

        const address = {
            line1: '12345 Testing',
            line2: 'Main str',
            city: 'City',
            state: 'State',
            country: 'United States',
            postal_code: '95545',
        }

        const shippingChangeEvent: StripeShippingEvent = {
            elementType: '',
            empty: false,
            complete: true,
            phoneFieldRequired: false,
            value: {
                phone: '555-444-5555',
                firstName: 'John',
                lastName: 'Doe',
                address,
            }
        }

        renderContainer({ isLoading: false });

        await act(async () => {
            const { stripeupe } = defaultProps.initialize.mock.calls[0][0];

            await stripeupe.onChangeShipping(shippingChangeEvent);
        });

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    })
});
