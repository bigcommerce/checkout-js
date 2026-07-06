import {
    type BillingAddress,
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { type FunctionComponent } from 'react';

import {
    CapabilitiesContext,
    CheckoutProvider,
    defaultCapabilities,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { mapAddressFromFormValues, mapAddressToFormValues } from '../../address';
import { getFormFields } from '../../address/formField.mock';
import { getBillingAddress } from '../../billing/billingAddresses.mock';
import { type BillingFormProps, type BillingFormValues } from '../../billing/BillingForm';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';

import PaymentBillingBlock from './PaymentBillingBlock';

let mockCapturedProps: BillingFormProps;

let mockPersistValues: BillingFormValues;

// Stand in for BillingForm: capture the props the container passes and expose a
// button that invokes the embedded auto-save callback (onSubmit) so we can test
// the container's persistence wiring without driving the real address form.
jest.mock('../../billing/BillingForm', () => ({
    __esModule: true,
    default: (props: BillingFormProps) => {
        mockCapturedProps = props;

        return (
            <button
                data-test="trigger-persist"
                onClick={() => props.onSubmit(mockPersistValues)}
                type="button"
            >
                persist
            </button>
        );
    },
}));

describe('PaymentBillingBlock', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let onUnhandledError: jest.Mock;
    let PaymentBillingBlockTest: FunctionComponent;

    const formFields = getFormFields();

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        onUnhandledError = jest.fn();

        mockPersistValues = {
            ...mapAddressToFormValues(formFields, getBillingAddress()),
            orderComment: getCheckout().customerMessage,
        } as BillingFormValues;

        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'updateBillingAddress').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'updateCheckout').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());
        jest.spyOn(checkoutState.data, 'getBillingAddressFields').mockReturnValue(formFields);
        jest.spyOn(checkoutState.data, 'getAddressExtraFields').mockReturnValue([]);
        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(undefined);

        PaymentBillingBlockTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CapabilitiesContext.Provider value={defaultCapabilities}>
                        <PaymentBillingBlock onUnhandledError={onUnhandledError} />
                    </CapabilitiesContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders the billing address heading', async () => {
        render(<PaymentBillingBlockTest />);

        expect(await screen.findByTestId('billing-address-heading')).toBeInTheDocument();
    });

    it('loads billing address fields on mount', () => {
        render(<PaymentBillingBlockTest />);

        expect(checkoutService.loadBillingAddressFields).toHaveBeenCalled();
    });

    it('renders BillingForm in embedded mode', async () => {
        render(<PaymentBillingBlockTest />);

        await screen.findByTestId('trigger-persist');

        expect(mockCapturedProps.isEmbedded).toBe(true);
    });

    it('persists a changed billing address via updateBillingAddress', async () => {
        render(<PaymentBillingBlockTest />);

        fireEvent.click(await screen.findByTestId('trigger-persist'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
    });

    it('does not call updateBillingAddress when the address is unchanged', async () => {
        const { orderComment: _orderComment, ...addressValues } = mockPersistValues;
        const unchangedAddress = mapAddressFromFormValues(
            addressValues,
            B2BSessionStorage.billingExtraFieldsKey,
        );

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(
            unchangedAddress as BillingAddress,
        );

        render(<PaymentBillingBlockTest />);

        fireEvent.click(await screen.findByTestId('trigger-persist'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
    });

    it('updates the checkout when the order comment changes', async () => {
        mockPersistValues = { ...mockPersistValues, orderComment: 'new comment' };

        render(<PaymentBillingBlockTest />);

        fireEvent.click(await screen.findByTestId('trigger-persist'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.updateCheckout).toHaveBeenCalledWith({
            customerMessage: 'new comment',
        });
    });
});
