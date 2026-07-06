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
import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { getCart } from '../cart/carts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';

import { getBillingAddress, getEmptyBillingAddress } from './billingAddresses.mock';
import BillingForm, { type BillingFormProps } from './BillingForm';

// Replace the address inputs with lightweight focus targets. Validity is driven
// by the billingAddress prop + form fields, so validateForm still gates the
// embedded auto-save without rendering the real address form.
jest.mock('../address', () => ({
    ...jest.requireActual('../address'),
    AddressForm: () => (
        <div>
            <input data-test="billing-field-a" />
            <input data-test="billing-field-b" />
        </div>
    ),
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

describe('BillingForm embedded mode', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let onSubmit: jest.Mock;
    let defaultProps: BillingFormProps;

    const renderForm = (props: BillingFormProps) => {
        const Wrapper: FunctionComponent = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CapabilitiesContext.Provider value={defaultCapabilities}>
                        <BillingForm {...props} />
                        <button data-test="outside" type="button">
                            outside
                        </button>
                    </CapabilitiesContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        return render(<Wrapper />);
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        onSubmit = jest.fn();

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
            isEmbedded: true,
            navigateNextStep: noop,
            onSubmit,
            onUnhandledError: noop,
        };
    });

    it('renders without the standalone submit button', () => {
        renderForm(defaultProps);

        expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    });

    it('does not render its own <form> element', () => {
        renderForm(defaultProps);

        // eslint-disable-next-line testing-library/no-node-access -- asserting the embedded block has no nested <form>
        expect(document.querySelector('form')).not.toBeInTheDocument();
        expect(screen.getByTestId('checkout-billing-form')).toBeInTheDocument();
    });

    it('persists via onSubmit when the address is valid and focus leaves the block', async () => {
        renderForm(defaultProps);

        await userEvent.click(screen.getByTestId('billing-field-a'));
        await userEvent.click(screen.getByTestId('outside'));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it('does not persist when the address is invalid', async () => {
        renderForm({ ...defaultProps, billingAddress: getEmptyBillingAddress() });

        await userEvent.click(screen.getByTestId('billing-field-a'));
        await userEvent.click(screen.getByTestId('outside'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not persist while focus stays inside the block', async () => {
        renderForm(defaultProps);

        await userEvent.click(screen.getByTestId('billing-field-a'));
        await userEvent.click(screen.getByTestId('billing-field-b'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('renders the standalone submit button when not embedded', () => {
        renderForm({ ...defaultProps, isEmbedded: false });

        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });
});
