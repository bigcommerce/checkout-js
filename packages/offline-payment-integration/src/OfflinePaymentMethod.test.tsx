import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import OfflinePaymentMethod from './OfflinePaymentMethod';
import { getMethod } from './payment-method.mock';

jest.mock('@bigcommerce/checkout/contexts', () => ({
    ...jest.requireActual<typeof import('@bigcommerce/checkout/contexts')>(
        '@bigcommerce/checkout/contexts',
    ),
    useCapabilities: jest.fn(),
}));

const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;

const baseCapabilities = {
    userJourney: {
        disableEditCart: false,
        hasCompanyAddressBook: false,
        hasAddressExtraFields: false,
        requiresB2BToken: true,
    },
    customer: { superAdminCompanySelector: false },
    shipping: {
        restrictManualAddressEntry: false,
        prefillCompanyAddress: false,
        hideSaveToAddressBookCheck: false,
        hideBillingSameAsShippingCheck: false,
    },
    billing: { restrictManualAddressEntry: false, hideSaveToAddressBookCheck: false },
    payment: {
        paymentMethodFiltering: false,
        b2bPaymentMethodFilter: false,
        poPaymentMethod: false,
        poConfig: null,
        additionalPaymentNotes: false,
        additionalField: null,
        excludeOfflineForInvoice: false,
        excludePPSDK: false,
    },
    orderConfirmation: {
        orderSummary: false,
        persistB2BMetadata: false,
        storeQuoteId: false,
        storeInvoiceReference: false,
        invoiceRedirect: false,
    },
} as ReturnType<typeof useCapabilities>;

describe('OfflinePaymentMethod', () => {
    let checkoutService: ReturnType<typeof createCheckoutService>;
    let defaultProps: PaymentMethodProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            method: getMethod(),
            checkoutService,
            checkoutState: checkoutService.getState(),

            paymentForm: jest.fn() as unknown as PaymentMethodProps['paymentForm'],

            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        mockUseCapabilities.mockReturnValue(baseCapabilities);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes payment method when component mounts', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        render(<OfflinePaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createOfflinePaymentStrategy],
        });
    });

    it('catches error during offline initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));

        render(<OfflinePaymentMethod {...defaultProps} />);

        await expect(checkoutService.initializePayment).rejects.toThrow('test error');
    });

    it('deinitializes payment method when component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<OfflinePaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during offline deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const { unmount } = render(<OfflinePaymentMethod {...defaultProps} />);

        unmount();

        await expect(checkoutService.deinitializePayment).rejects.toThrow('test error');
    });

    describe('PO Number rendering', () => {
        const chequeMethod = { ...getMethod(), id: 'cheque' };
        const poConfig = {
            label: 'PO Number',
            required: true,
            creditLimit: 5000,
            currency: 'USD',
        };

        beforeEach(() => {
            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
                checkoutService.getState(),
            );
        });

        it('renders nothing when poPaymentMethod capability is off (even with poConfig)', () => {
            mockUseCapabilities.mockReturnValue({
                ...baseCapabilities,
                payment: { ...baseCapabilities.payment, poPaymentMethod: false, poConfig },
            });

            render(<OfflinePaymentMethod {...defaultProps} method={chequeMethod} />);

            expect(screen.queryByLabelText(/PO Number/)).not.toBeInTheDocument();
        });

        it('renders nothing when poConfig is missing (even with poPaymentMethod on)', () => {
            mockUseCapabilities.mockReturnValue({
                ...baseCapabilities,
                payment: { ...baseCapabilities.payment, poPaymentMethod: true },
            });

            render(<OfflinePaymentMethod {...defaultProps} method={chequeMethod} />);

            expect(screen.queryByLabelText(/PO Number/)).not.toBeInTheDocument();
        });

        it('renders nothing when method id is not cheque', () => {
            mockUseCapabilities.mockReturnValue({
                ...baseCapabilities,
                payment: { ...baseCapabilities.payment, poPaymentMethod: true, poConfig },
            });

            render(<OfflinePaymentMethod {...defaultProps} />);

            expect(screen.queryByLabelText(/PO Number/)).not.toBeInTheDocument();
        });

        it('renders PoNumber input with the configured label when all conditions are met', () => {
            mockUseCapabilities.mockReturnValue({
                ...baseCapabilities,
                payment: { ...baseCapabilities.payment, poPaymentMethod: true, poConfig },
            });

            render(<OfflinePaymentMethod {...defaultProps} method={chequeMethod} />);

            expect(screen.getByText(poConfig.label)).toBeInTheDocument();
        });

        it('shows the optional suffix when poConfig.required is false', () => {
            mockUseCapabilities.mockReturnValue({
                ...baseCapabilities,
                payment: {
                    ...baseCapabilities.payment,
                    poPaymentMethod: true,
                    poConfig: { ...poConfig, required: false },
                },
            });

            render(<OfflinePaymentMethod {...defaultProps} method={chequeMethod} />);

            expect(screen.getByText(/Optional/i)).toBeInTheDocument();
        });
    });
});
