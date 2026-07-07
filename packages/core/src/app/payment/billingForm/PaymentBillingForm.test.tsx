import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import {
    CapabilitiesContext,
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { getBillingAddress, getEmptyBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import PaymentContext, { type BillingAddressFlush } from '../PaymentContext';

import PaymentBillingForm, { type PaymentBillingFormProps } from './PaymentBillingForm';

// Lightweight focus/render stubs — validity is driven by billingAddress + fields,
// so validateForm still gates the flush without the real address form.
jest.mock('../../address', () => ({
    ...jest.requireActual('../../address'),
    AddressForm: () => <div data-test="billing-fields" />,
    AddressSelect: () => <div data-test="address-select" />,
}));

const billingFields: FormField[] = [
    {
        custom: false,
        default: '',
        id: 'field_14',
        label: 'First Name',
        name: 'firstName',
        required: true,
    },
    {
        custom: false,
        default: '',
        id: 'field_15',
        label: 'Last Name',
        name: 'lastName',
        required: true,
    },
    {
        custom: false,
        default: '',
        id: 'field_18',
        label: 'Address Line 1',
        name: 'address1',
        required: true,
    },
];

describe('PaymentBillingForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let onPersist: jest.Mock;
    let capturedFlush: BillingAddressFlush | null;
    let registerBillingAddressFlush: jest.Mock;
    let defaultProps: PaymentBillingFormProps;

    const renderForm = (props: PaymentBillingFormProps) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CapabilitiesContext.Provider value={defaultCapabilities}>
                        <PaymentContext.Provider
                            value={{
                                registerBillingAddressFlush,
                                disableSubmit: jest.fn(),
                                setSubmit: jest.fn(),
                                setValidationSchema: jest.fn(),
                                hidePaymentSubmitButton: jest.fn(),
                            }}
                        >
                            <PaymentBillingForm {...props} />
                        </PaymentContext.Provider>
                    </CapabilitiesContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        onPersist = jest.fn().mockResolvedValue(undefined);
        capturedFlush = null;
        registerBillingAddressFlush = jest.fn((flush: BillingAddressFlush | null) => {
            capturedFlush = flush;
        });

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: true,
            addresses: [],
        });

        defaultProps = {
            billingAddress: getBillingAddress(),
            customerMessage: '',
            getFields: () => billingFields,
            onPersist,
            onUnhandledError: noop,
        };
    });

    it('renders the address fields without a submit button', () => {
        renderForm(defaultProps);

        expect(screen.getByTestId('checkout-billing-form')).toBeInTheDocument();
        expect(screen.getByTestId('billing-fields')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    });

    it('does not render its own <form> element', () => {
        renderForm(defaultProps);

        expect(document.querySelector('form')).not.toBeInTheDocument();
    });

    it('registers a flush on PaymentContext', async () => {
        renderForm(defaultProps);

        await waitFor(() =>
            expect(registerBillingAddressFlush).toHaveBeenCalledWith(expect.any(Function)),
        );
    });

    it('flush persists and resolves true when the address is valid', async () => {
        renderForm(defaultProps);

        await waitFor(() => expect(capturedFlush).toEqual(expect.any(Function)));

        await expect(capturedFlush?.()).resolves.toBe(true);
        expect(onPersist).toHaveBeenCalled();
    });

    it('flush resolves false and does not persist when the address is invalid', async () => {
        renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

        await waitFor(() => expect(capturedFlush).toEqual(expect.any(Function)));

        await expect(capturedFlush?.()).resolves.toBe(false);
        expect(onPersist).not.toHaveBeenCalled();
    });
});
