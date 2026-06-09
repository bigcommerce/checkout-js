import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createNetTermsPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/net-terms';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type ReactElement } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import NetTermsPaymentMethod from './NetTermsPaymentMethod';
import { getMethod } from './payment-method.mock';

const renderWithFormik = (ui: ReactElement) =>
    render(
        <Formik initialValues={{ poNumber: '' }} onSubmit={noop}>
            {ui}
        </Formik>,
    );

describe('NetTermsPaymentMethod', () => {
    let checkoutService: ReturnType<typeof createCheckoutService>;
    let defaultProps: PaymentMethodProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            method: getMethod(),
            checkoutService,
            checkoutState: checkoutService.getState(),
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(
            checkoutService.getState(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes the net terms payment strategy when the component mounts', () => {
        renderWithFormik(<NetTermsPaymentMethod {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            gatewayId: defaultProps.method.gateway,
            methodId: defaultProps.method.id,
            integrations: [createNetTermsPaymentStrategy],
        });
    });

    it('renders a required PO Number input (no optional suffix)', () => {
        renderWithFormik(<NetTermsPaymentMethod {...defaultProps} />);

        expect(screen.getByRole('textbox')).toHaveAttribute('id', 'poNumber');
        expect(screen.queryByText(/Optional/i)).not.toBeInTheDocument();
    });

    it('registers the PO Number validation schema with the payment form', () => {
        renderWithFormik(<NetTermsPaymentMethod {...defaultProps} />);

        expect(defaultProps.paymentForm.setValidationSchema).toHaveBeenCalledWith(
            defaultProps.method,
            expect.anything(),
        );
    });

    it('deinitializes the payment method when the component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = renderWithFormik(<NetTermsPaymentMethod {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });
});
