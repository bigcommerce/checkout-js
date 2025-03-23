
import React from 'react';
import { render, screen } from '@testing-library/react';
import { getAddress, getCustomer } from '@bigcommerce/checkout/test-mocks';
import { CheckoutSelectors, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { PayPalFastlaneShippingAddress, PayPalFastlaneShippingAddressProps } from './PayPalFastlaneShippingAddress';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { getStoreConfig } from '../config/config.mock';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';
import { noop } from 'lodash';
import { Formik } from 'formik';

jest.mock('@bigcommerce/checkout/paypal-fastlane-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/paypal-fastlane-integration'),
    usePayPalFastlaneAddress: jest.fn(() => ({
        isPayPalFastlaneEnabled: false,
        paypalFastlaneAddresses: [],
    })),
}));

describe('PayPalFastlaneShippingAddress', () => {
    let component;
    let defaultProps: PayPalFastlaneShippingAddressProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        const paypalFastlaneAddresses = [{
            ...getAddress(),
            address1: 'PP Fastlane address'
        }];

        (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
            isPayPalFastlaneEnabled: true,
            paypalFastlaneAddresses,
            shouldShowPayPalFastlaneShippingForm: true,
        });

        defaultProps = {
            consignments:[],
            countriesWithAutocomplete: [],
            handleFieldChange: jest.fn(),
            isShippingStepPending: false,
            hasRequestedShippingOptions: false,
            onUseNewAddress: jest.fn(),
            addresses: getCustomer().addresses,
            shippingAddress: getCustomer().addresses[0],
            formFields: [
                {
                    custom: false,
                    default: 'NO PO BOX',
                    id: 'field_18',
                    label: 'Address Line 1',
                    name: 'address1',
                    required: true,
                },
                {
                    custom: true,
                    default: '',
                    id: 'field_19',
                    label: 'Address Line 2',
                    name: 'address2',
                    required: false,
                },
            ],
            isLoading: false,
            methodId: 'paypalcommerceacceleratedcheckout',
            deinitialize: jest.fn(),
            initialize: jest.fn(),
            onAddressSelect: jest.fn(),
            onFieldChange: jest.fn(),
            onUnhandledError: jest.fn(),
            countries: [
                {
                    code: 'US',
                    name: 'United States',
                    hasPostalCodes: true,
                    requiresState: true,
                    subdivisions: [
                        { code: 'CA', name: 'California' },
                        { code: 'TX', name: 'Texas' },
                    ],
                }
            ],
        };
    })

    it('renders PayPalFastlaneShippingAddress edit button', async () => {
        component = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        <PayPalFastlaneShippingAddress {...defaultProps} />);
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            </Formik>
        );

        const fastlaneEditButton = await screen.findByTestId('step-edit-button');

        expect(fastlaneEditButton).toBeInTheDocument();
    });

    it('initializes fastlane shipping strategy', async () => {
        const initializeMock = jest.fn();

        component = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        <PayPalFastlaneShippingAddress {...defaultProps} initialize={initializeMock} />);
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            </Formik>
        );

        expect(initializeMock).toHaveBeenCalled();
    });

    it('renders regular shipping form if shouldShowPayPalFastlaneShippingForm false', async () => {
        const paypalFastlaneAddresses = [{
            ...getAddress(),
            address1: 'PP Fastlane address'
        }];
        (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
            isPayPalFastlaneEnabled: true,
            paypalFastlaneAddresses,
            shouldShowPayPalFastlaneShippingForm: false,
        });

        component = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                        <PayPalFastlaneShippingAddress {...defaultProps} />);
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            </Formik>
        );

        try {
            await screen.findByTestId('step-edit-button');
        } catch (error) {
            expect(error).toBeDefined();
        }

        const countryText = await screen.findByText('United States');
        const stateText = await screen.findByText('California,');
        const streetText = await screen.findByText('12345 Testing Way');

        expect(countryText).toBeInTheDocument();
        expect(streetText).toBeInTheDocument();
        expect(stateText).toBeInTheDocument();
    });
});
