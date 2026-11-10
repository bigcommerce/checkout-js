import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type FormField,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { act, type FunctionComponent } from 'react';

import {
    CapabilitiesContext,
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { fireEvent, render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { getAddress } from '../../address/address.mock';
import { getFormFields } from '../../address/formField.mock';
import { getBillingAddress, getEmptyBillingAddress } from '../../billing/billingAddresses.mock';
import { getCart } from '../../cart/carts.mock';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer, getGuestCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
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
            isUsingMultiShipping: false,
            onBillingCountryChange: jest.fn(),
            onBillingSameAsShippingChange: jest.fn(),
            onPersist,
            onSelectAddress: jest.fn().mockResolvedValue(undefined),
            onUnhandledError: noop,
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

        // Keep the address selection in flight so isResettingAddress stays true.
        const onSelectAddress = jest.fn().mockReturnValue(new Promise(() => undefined));

        renderForm({ ...defaultProps, onSelectAddress });

        // Trigger an address-book selection ("Enter a new address"), which sets
        // isResettingAddress while onSelectAddress runs.
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
        it('notifies onBillingCountryChange with the new country and the current form values', async () => {
            renderForm({ ...defaultProps, getFields: getFieldsWithCountry });

            await userEvent.clear(screen.getByTestId('firstNameInput-text'));
            await userEvent.type(screen.getByTestId('firstNameInput-text'), 'Jane');

            await userEvent.selectOptions(screen.getByTestId('countryCodeInput-select'), 'CA');

            expect(defaultProps.onBillingCountryChange).toHaveBeenCalledWith(
                'CA',
                expect.objectContaining({ firstName: 'Jane' }),
                '',
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

    describe('billing state dropdown change', () => {
        it('persists the new state code and clears the state name', async () => {
            renderForm({
                ...defaultProps,
                getFields: (): FormField[] => [
                    ...getFieldsWithCountry(),
                    {
                        custom: false,
                        default: '',
                        fieldType: 'dropdown',
                        id: 'field_state',
                        label: 'State',
                        name: 'stateOrProvinceCode',
                        options: {
                            items: [
                                { label: 'California', value: 'CA' },
                                { label: 'Texas', value: 'TX' },
                            ],
                        },
                        required: false,
                        type: 'array',
                    },
                ],
            });

            await userEvent.selectOptions(screen.getByTestId('provinceCodeInput-select'), 'TX');

            expect(onPersist).toHaveBeenCalledWith(
                expect.objectContaining({ stateOrProvince: '', stateOrProvinceCode: 'TX' }),
            );
        });
    });

    describe('billing postal code change', () => {
        const getFieldsWithPostalCode = (): FormField[] => [
            ...getFieldsWithCountry(),
            {
                custom: false,
                default: '',
                id: 'field_postal',
                label: 'Postal Code',
                name: 'postalCode',
                required: false,
            },
        ];

        const typePostalCodeInForm = async () => {
            renderForm({ ...defaultProps, getFields: getFieldsWithPostalCode });

            const postalCodeInput = screen.getByTestId('postCodeInput-text');

            await userEvent.clear(postalCodeInput);
            await userEvent.type(postalCodeInput, '90210');

            return postalCodeInput;
        };

        it('does not persist when the address has no country', async () => {
            renderForm({
                ...defaultProps,
                billingAddress: { ...getBillingAddress(), countryCode: '' },
                getFields: getFieldsWithPostalCode,
            });

            await userEvent.type(screen.getByTestId('postCodeInput-text'), '1');
            await userEvent.click(screen.getByTestId('firstNameInput-text'));

            expect(onPersist).not.toHaveBeenCalled();
        });

        it('persists when moving to another field, not while typing', async () => {
            await typePostalCodeInForm();

            expect(onPersist).not.toHaveBeenCalled();

            await userEvent.click(screen.getByTestId('firstNameInput-text'));

            expect(onPersist).toHaveBeenCalledTimes(1);
            expect(onPersist).toHaveBeenCalledWith(
                expect.objectContaining({ postalCode: '90210', orderComment: '' }),
            );
            expect(onPersist.mock.calls[0][0]).not.toHaveProperty('billingSameAsShipping');
        });

        it('does not persist when the postal code matches the saved one', async () => {
            renderForm({ ...defaultProps, getFields: getFieldsWithPostalCode });

            const postalCodeInput = screen.getByTestId('postCodeInput-text');

            await userEvent.clear(postalCodeInput);
            await userEvent.type(postalCodeInput, '95555');
            await userEvent.click(screen.getByTestId('firstNameInput-text'));

            expect(onPersist).not.toHaveBeenCalled();
        });

        it('does not persist when focus moves to a submit button', async () => {
            const submitButton = document.createElement('button');

            submitButton.type = 'submit';
            document.body.appendChild(submitButton);

            await typePostalCodeInForm();

            act(() => submitButton.focus());

            expect(onPersist).not.toHaveBeenCalled();

            submitButton.remove();
        });

        it('does not persist when focus moves nowhere', async () => {
            const postalCodeInput = await typePostalCodeInForm();

            act(() => postalCodeInput.blur());

            expect(onPersist).not.toHaveBeenCalled();
        });

        it('reports editing while a text field is focused and not after it blurs', async () => {
            const onAddressEditingChange = jest.fn();

            renderForm({ ...defaultProps, onAddressEditingChange });

            await userEvent.click(screen.getByTestId('firstNameInput-text'));

            expect(onAddressEditingChange).toHaveBeenLastCalledWith(true);

            act(() => screen.getByTestId('firstNameInput-text').blur());

            expect(onAddressEditingChange).toHaveBeenLastCalledWith(false);
        });

        it('does not report editing for the country select', async () => {
            const onAddressEditingChange = jest.fn();

            renderForm({
                ...defaultProps,
                getFields: getFieldsWithCountry,
                onAddressEditingChange,
            });

            await userEvent.click(screen.getByTestId('countryCodeInput-select'));

            expect(onAddressEditingChange).toHaveBeenLastCalledWith(false);
        });

        it('does not persist when a non-tax field is blurred', async () => {
            renderForm(defaultProps);

            await userEvent.type(screen.getByTestId('firstNameInput-text'), 'Jane');
            await userEvent.tab();

            expect(onPersist).not.toHaveBeenCalled();
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

        it('hides the toggle and shows the address fields when using multi-shipping', () => {
            renderForm({
                ...defaultProps,
                isBillingSameAsShipping: true,
                isUsingMultiShipping: true,
            });

            expect(screen.queryByTestId('billingSameAsShipping')).not.toBeInTheDocument();
            expect(screen.getByText('First Name')).toBeInTheDocument();
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

    describe('address book', () => {
        const consignmentAddress = {
            ...getAddress(),
            address1: '1 Consignment Way',
            email: '',
        };

        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        });

        const mockMultiShipping = () => {
            jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([
                { ...getConsignment(), id: 'consignment-1', shippingAddress: consignmentAddress },
                { ...getConsignment(), id: 'consignment-2' },
            ]);
        };

        it('hides the address fields and prompts to enter or select an address when there is no billing address', () => {
            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            expect(screen.queryByText('First Name')).not.toBeInTheDocument();
            expect(screen.getByText('Enter or select an address')).toBeInTheDocument();
        });

        it('shows the address fields when the shopper chooses to enter a new address', async () => {
            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            fireEvent.click(await screen.findByTestId('address-select-button'));
            fireEvent.click(await screen.findByTestId('add-new-address'));

            expect(await screen.findByText('First Name')).toBeInTheDocument();
            expect(screen.queryByText('Enter or select an address')).not.toBeInTheDocument();
        });

        it('shows the address fields when the billing address does not match a valid saved address', () => {
            renderForm({
                ...defaultProps,
                billingAddress: {
                    ...getBillingAddress(),
                    address1: 'Infinity Testing Way',
                    firstName: 'Invalid Address',
                    lastName: '',
                },
            });

            expect(screen.getByText('First Name')).toBeInTheDocument();
        });

        it('shows the address fields when the billing address fails validation on submit', async () => {
            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            await waitFor(() =>
                expect(capturedEnsureBillingAddressSaved).toEqual(expect.any(Function)),
            );

            expect(screen.queryByText('First Name')).not.toBeInTheDocument();

            await act(async () => {
                await expect(capturedEnsureBillingAddressSaved?.()).resolves.toBe(false);
            });

            expect(await screen.findByText('First Name')).toBeInTheDocument();
        });

        it('shows the address fields and no address book when there are no addresses', () => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            expect(screen.queryByTestId('address-select-button')).not.toBeInTheDocument();
            expect(screen.getByText('First Name')).toBeInTheDocument();
        });

        it('lists the shipping addresses when shipping to multiple addresses', async () => {
            mockMultiShipping();

            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            fireEvent.click(await screen.findByTestId('address-select-button'));

            expect(await screen.findByText(consignmentAddress.address1)).toBeInTheDocument();
        });

        it('selects a shipping address without its placeholder id, type or email', async () => {
            mockMultiShipping();

            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            fireEvent.click(await screen.findByTestId('address-select-button'));
            fireEvent.click(await screen.findByText(consignmentAddress.address1));

            await waitFor(() => expect(defaultProps.onSelectAddress).toHaveBeenCalledTimes(1));

            const [selectedAddress, orderComment] = (defaultProps.onSelectAddress as jest.Mock).mock
                .calls[0];

            expect(selectedAddress).toEqual(
                expect.objectContaining({ address1: consignmentAddress.address1 }),
            );
            expect(selectedAddress).not.toHaveProperty('id');
            expect(selectedAddress).not.toHaveProperty('type');
            expect(selectedAddress).not.toHaveProperty('email');
            expect(orderComment).toBe('');
        });

        it('selects a saved address as it is', async () => {
            renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

            fireEvent.click(await screen.findByTestId('address-select-button'));
            fireEvent.click(await screen.findByText('67890 Testing Way'));

            await waitFor(() =>
                expect(defaultProps.onSelectAddress).toHaveBeenCalledWith(
                    expect.objectContaining({ id: 6, address1: '67890 Testing Way' }),
                    '',
                ),
            );
        });
    });

    describe('order comments', () => {
        const orderCommentInput = () => screen.getByLabelText('Order Comments');

        beforeEach(() => {
            const cart = getCart();

            jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
                ...cart,
                lineItems: { ...cart.lineItems, physicalItems: [] },
            });

            defaultProps = { ...defaultProps, getFields: getFieldsWithCountry };
        });

        it('seeds the order comment from the checkout customer message', () => {
            renderForm({ ...defaultProps, customerMessage: 'leave at reception' });

            expect(orderCommentInput()).toHaveValue('leave at reception');
        });

        it('sends the typed order comment to onBillingCountryChange', async () => {
            renderForm(defaultProps);

            await userEvent.type(orderCommentInput(), 'leave at reception');
            await userEvent.selectOptions(screen.getByTestId('countryCodeInput-select'), 'CA');

            expect(defaultProps.onBillingCountryChange).toHaveBeenCalledWith(
                'CA',
                expect.anything(),
                'leave at reception',
            );
        });

        it('sends a cleared order comment to onBillingCountryChange', async () => {
            const props = { ...defaultProps, customerMessage: 'leave at reception' };

            renderForm(props);

            await userEvent.clear(orderCommentInput());
            await userEvent.selectOptions(screen.getByTestId('countryCodeInput-select'), 'CA');

            expect(props.onBillingCountryChange).toHaveBeenCalledWith('CA', expect.anything(), '');
        });

        it('sends the typed order comment to onSelectAddress', async () => {
            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
                ...getCustomer(),
                isGuest: false,
            });

            renderForm(defaultProps);

            await userEvent.type(orderCommentInput(), 'leave at reception');

            fireEvent.click(await screen.findByTestId('address-select-button'));
            fireEvent.click(await screen.findByTestId('add-new-address'));

            await waitFor(() =>
                expect(defaultProps.onSelectAddress).toHaveBeenCalledWith({}, 'leave at reception'),
            );
        });

        it('shows the saved order comment once it lands in checkout state', async () => {
            const { rerender } = renderForm(defaultProps);

            await userEvent.type(orderCommentInput(), 'leave at reception');

            rerender(
                <PaymentBillingFormTest
                    {...defaultProps}
                    billingAddress={{ ...getBillingAddress(), countryCode: 'CA' }}
                    customerMessage="leave at reception"
                />,
            );

            expect(screen.getByTestId('firstNameInput-text')).toHaveValue(
                getBillingAddress().firstName,
            );
            expect(orderCommentInput()).toHaveValue('leave at reception');
        });
    });
});
