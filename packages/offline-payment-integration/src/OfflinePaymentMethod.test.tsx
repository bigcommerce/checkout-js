import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import { Formik } from 'formik';
import React from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import OfflinePaymentMethod from './OfflinePaymentMethod';
import { getMethod } from './payment-method.mock';

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

    describe('formFieldsData', () => {
        const formFieldsData = [
            {
                name: 'Purchase Order',
                id: 'purchaseOrderNumber',
                required: true,
                type: 'number',
                fieldType: 'text',
            },
        ];

        it('returns null when formFieldsData is not present', () => {
            const { container } = render(<OfflinePaymentMethod {...defaultProps} />);

            expect(container).toBeEmptyDOMElement();
        });

        it('returns null when formFieldsData is an empty array', () => {
            const props = {
                ...defaultProps,
                method: { ...defaultProps.method, initializationData: { formFieldsData: [] } },
            };

            const { container } = render(<OfflinePaymentMethod {...props} />);

            expect(container).toBeEmptyDOMElement();
        });

        it('renders fields from formFieldsData via PaymentFormFields', () => {
            const props = {
                ...defaultProps,
                method: { ...defaultProps.method, initializationData: { formFieldsData } },
            };

            render(
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                    <OfflinePaymentMethod {...props} />
                </Formik>,
            );

            expect(screen.getByLabelText('Purchase Order')).toBeInTheDocument();
        });
    });
});
