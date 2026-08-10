import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CapabilitiesContext,
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { getFormFields } from '../../address/formField.mock';
import { getBillingAddress, getEmptyBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import PaymentContext, { type EnsureBillingAddressSaved } from '../PaymentContext';

import { PaymentBillingForm, type PaymentBillingFormProps } from './PaymentBillingForm';

describe('PaymentBillingForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let onPersist: jest.Mock;
    let capturedEnsureBillingAddressSaved: EnsureBillingAddressSaved | null;
    let setEnsureBillingAddressSaved: jest.Mock;
    let defaultProps: PaymentBillingFormProps;

    const PaymentBillingFormTest: FunctionComponent<PaymentBillingFormProps> = (props) => (
        <CheckoutProvider checkoutService={checkoutService}>
            <LocaleContext.Provider value={localeContext}>
                <CapabilitiesContext.Provider value={defaultCapabilities}>
                    <PaymentContext.Provider
                        value={{
                            setEnsureBillingAddressSaved,
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
        </CheckoutProvider>
    );

    const renderForm = (props: PaymentBillingFormProps) =>
        render(<PaymentBillingFormTest {...props} />);

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        onPersist = jest.fn().mockResolvedValue(undefined);
        capturedEnsureBillingAddressSaved = null;
        setEnsureBillingAddressSaved = jest.fn(
            (ensureBillingAddressSaved: EnsureBillingAddressSaved | null) => {
                capturedEnsureBillingAddressSaved = ensureBillingAddressSaved;
            },
        );

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: true,
            addresses: [],
        });
        jest.spyOn(checkoutState.statuses, 'isUpdatingBillingAddress').mockReturnValue(false);

        defaultProps = {
            billingAddress: getBillingAddress(),
            customerMessage: '',
            getFields: () => getFormFields(),
            isBillingSameAsShipping: false,
            isLoading: false,
            onBillingCountryChange: jest.fn(),
            onBillingSameAsShippingChange: jest.fn(),
            onPersist,
            onUnhandledError: noop,
            updateBillingAddress: jest.fn().mockResolvedValue(undefined),
        };
    });

    it('renders the address fields without a submit button', () => {
        renderForm(defaultProps);

        expect(screen.getByTestId('checkout-billing-form')).toBeInTheDocument();
        expect(screen.getByText('First Name')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    });

    it('does not render its own <form> element', () => {
        renderForm(defaultProps);

        // eslint-disable-next-line testing-library/no-node-access
        expect(document.querySelector('form')).not.toBeInTheDocument();
    });

    it('sets its ensureBillingAddressSaved on the payment context', async () => {
        renderForm(defaultProps);

        await waitFor(() =>
            expect(setEnsureBillingAddressSaved).toHaveBeenCalledWith(expect.any(Function)),
        );
    });

    it('blocks (resolves false) and does not persist while still loading', async () => {
        renderForm({ ...defaultProps, isLoading: true });

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(false);
        expect(onPersist).not.toHaveBeenCalled();
    });

    it('blocks and does not persist while an address selection is still being applied', async () => {
        // Registered customer with a saved address so the address book renders.
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: false,
        });

        // Keep updateBillingAddress in flight so isResettingAddress stays true.
        const updateBillingAddress = jest.fn().mockReturnValue(new Promise(() => undefined));

        renderForm({ ...defaultProps, updateBillingAddress });

        // Trigger an address-book selection ("Enter a new address"), which sets
        // isResettingAddress while updateBillingAddress runs.
        fireEvent.click(await screen.findByTestId('address-select-button'));
        fireEvent.click(await screen.findByTestId('add-new-address'));

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(false);
        expect(onPersist).not.toHaveBeenCalled();
    });

    it('persists and resolves true when the address is valid', async () => {
        renderForm(defaultProps);

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(true);
        expect(onPersist).toHaveBeenCalled();
    });

    it('resolves false and does not persist when the address is invalid', async () => {
        renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(false);
        expect(onPersist).not.toHaveBeenCalled();
    });

    it('does not include the same-as-shipping flag in the persisted billing values', async () => {
        renderForm(defaultProps);

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await capturedEnsureBillingAddressSaved?.();

        expect(onPersist).toHaveBeenCalledWith(
            expect.not.objectContaining({ billingSameAsShipping: expect.anything() }),
        );
    });

    it('reports a persist failure via onUnhandledError and resolves false without throwing', async () => {
        const error = new Error('failed to save billing address');
        const onUnhandledError = jest.fn();

        onPersist.mockRejectedValueOnce(error);

        renderForm({ ...defaultProps, onUnhandledError });

        await waitFor(() =>
            expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
        );

        await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(false);
        expect(onUnhandledError).toHaveBeenCalledWith(error);
    });

    describe('billing country change', () => {
        const getFieldsWithCountry = (): FormField[] => [
            ...getFormFields(),
            {
                custom: false,
                default: '',
                fieldType: 'dropdown',
                id: 'field_country',
                label: 'Country',
                name: 'countryCode',
                options: {
                    helperLabel: 'Choose a Country',
                    items: [
                        { label: 'United States', value: 'US' },
                        { label: 'Canada', value: 'CA' },
                    ],
                },
                required: true,
                type: 'array',
            },
        ];

        it('notifies onBillingCountryChange with the new country and the current form values', async () => {
            renderForm({ ...defaultProps, getFields: getFieldsWithCountry });

            await userEvent.clear(screen.getByTestId('firstNameInput-text'));
            await userEvent.type(screen.getByTestId('firstNameInput-text'), 'Jane');

            await userEvent.selectOptions(screen.getByTestId('countryCodeInput-select'), 'CA');

            expect(defaultProps.onBillingCountryChange).toHaveBeenCalledWith(
                'CA',
                expect.objectContaining({ firstName: 'Jane' }),
            );

            const [, addressValues] = (defaultProps.onBillingCountryChange as jest.Mock).mock
                .calls[0];

            expect(addressValues).not.toHaveProperty('billingSameAsShipping');
            expect(addressValues).not.toHaveProperty('orderComment');
        });

        it('does not notify onBillingCountryChange when a non-country field changes', async () => {
            renderForm({ ...defaultProps, getFields: getFieldsWithCountry });

            await userEvent.type(screen.getByTestId('firstNameInput-text'), 'Jane');

            expect(defaultProps.onBillingCountryChange).not.toHaveBeenCalled();
        });
    });

    describe('billing same as shipping toggle', () => {
        it('renders the toggle with the payment-step label', () => {
            renderForm(defaultProps);

            expect(screen.getByTestId('billingSameAsShipping')).toBeInTheDocument();
            expect(screen.getByText('Same as shipping address')).toBeInTheDocument();
        });

        it('disables the toggle while a billing address update is in flight', () => {
            jest.spyOn(checkoutState.statuses, 'isUpdatingBillingAddress').mockReturnValue(true);

            renderForm(defaultProps);

            expect(screen.getByTestId('billingSameAsShipping')).toBeDisabled();
        });

        it('collapses the billing address fields when checked', () => {
            renderForm({ ...defaultProps, isBillingSameAsShipping: true });

            expect(screen.getByTestId('billingSameAsShipping')).toBeInTheDocument();
            expect(screen.queryByText('First Name')).not.toBeInTheDocument();
        });

        it('shows the billing address fields when unchecked', () => {
            renderForm({ ...defaultProps, isBillingSameAsShipping: false });

            expect(screen.getByText('First Name')).toBeInTheDocument();
        });

        it('resolves true without persisting when checked (billing mirrors shipping)', async () => {
            renderForm({ ...defaultProps, isBillingSameAsShipping: true });

            await waitFor(() =>
                expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
            );

            await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(true);
            expect(onPersist).not.toHaveBeenCalled();
        });

        it('hides the toggle for static-address methods (e.g. Amazon Pay)', () => {
            renderForm({ ...defaultProps, methodId: 'amazonpay' });

            expect(screen.queryByTestId('billingSameAsShipping')).not.toBeInTheDocument();
        });

        it('hides the toggle and shows the address fields for a digital-only cart', () => {
            const cart = getCart();

            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...cart,
                lineItems: { ...cart.lineItems, physicalItems: [] },
            });

            renderForm({ ...defaultProps, isBillingSameAsShipping: true });

            expect(screen.queryByTestId('billingSameAsShipping')).not.toBeInTheDocument();
            expect(screen.getByText('First Name')).toBeInTheDocument();
        });

        it('stays unchecked and does not re-fire on a billing address reinitialize', async () => {
            const onBillingSameAsShippingChange = jest.fn();
            const props = {
                ...defaultProps,
                isBillingSameAsShipping: false,
                billingAddress: getBillingAddress(),
                onBillingSameAsShippingChange,
            };

            const { rerender } = renderForm(props);

            expect(screen.getByText('First Name')).toBeInTheDocument();

            rerender(
                <PaymentBillingFormTest {...props} billingAddress={getEmptyBillingAddress()} />,
            );

            expect(await screen.findByText('First Name')).toBeInTheDocument();
            expect(onBillingSameAsShippingChange).not.toHaveBeenCalledWith(true);
        });

        it('notifies onBillingSameAsShippingChange when the shopper checks it', async () => {
            const onBillingSameAsShippingChange = jest.fn();

            renderForm({
                ...defaultProps,
                isBillingSameAsShipping: false,
                onBillingSameAsShippingChange,
            });

            fireEvent.click(screen.getByTestId('billingSameAsShipping'));

            await waitFor(() => expect(onBillingSameAsShippingChange).toHaveBeenCalledWith(true));
        });
    });
});
