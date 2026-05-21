import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React, { type ReactElement } from 'react';

import { CapabilitiesContext, defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import ChequePaymentMethod from './ChequePaymentMethod';
import { getMethod } from './payment-method.mock';

type PaymentCapabilities = typeof defaultCapabilities.payment;

const renderWithCapabilities = (
    ui: ReactElement,
    paymentOverrides: Partial<PaymentCapabilities> = {},
) =>
    render(
        <CapabilitiesContext.Provider
            value={{
                ...defaultCapabilities,
                payment: { ...defaultCapabilities.payment, ...paymentOverrides },
            }}
        >
            {ui}
        </CapabilitiesContext.Provider>,
    );

describe('ChequePaymentMethod', () => {
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes payment method when component mounts', () => {
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createOfflinePaymentStrategy],
        });
    });

    it('catches error during cheque initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));

        renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />);

        await expect(checkoutService.initializePayment).rejects.toThrow('test error');
    });

    it('deinitializes payment method when component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during cheque deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const { unmount } = renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />);

        unmount();

        await expect(checkoutService.deinitializePayment).rejects.toThrow('test error');
    });

    describe('PO Number rendering', () => {
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

        it('renders nothing when poConfig is missing', () => {
            renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />);

            expect(screen.queryByLabelText(/PO Number/)).not.toBeInTheDocument();
        });

        it('renders PoNumber input with the configured label when poConfig is set', () => {
            renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />, { poConfig });

            expect(screen.getByText(poConfig.label)).toBeInTheDocument();
        });

        it('shows the optional suffix when poConfig.required is false', () => {
            renderWithCapabilities(<ChequePaymentMethod {...defaultProps} />, {
                poConfig: { ...poConfig, required: false },
            });

            expect(screen.getByText(/Optional/i)).toBeInTheDocument();
        });
    });
});
