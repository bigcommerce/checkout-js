import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';

import {
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import {
    CheckoutProvider,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';

import InstrumentStoreAsDefaultField from './InstrumentStoreAsDefaultField';

describe('InstrumentStoreAsDefaultField', () => {
    let InstrumentStoreAsDefaultFieldTest: any;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(
            merge({}, getPaymentMethod(), {
                config: {
                    isVaultingEnabled: true,
                },
            }),
        );

        InstrumentStoreAsDefaultFieldTest = (props: any) => (
            <PaymentFormContext.Provider value={{ paymentForm }}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutProvider checkoutService={checkoutService}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <InstrumentStoreAsDefaultField {...props} />
                        </Formik>
                    </CheckoutProvider>
                </LocaleContext.Provider>
            </PaymentFormContext.Provider>
        );
    });

    it('renders checkbox with correct label when isAccountInstrument is true', () => {
        render(<InstrumentStoreAsDefaultFieldTest isAccountInstrument={true} />);

        const checkbox = screen.getByRole('checkbox');
        const label = screen.getByText(
            'Use this account as the default payment method for future transactions',
        );

        expect(checkbox).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    });

    it('disables checkbox when disabled prop is true', () => {
        render(<InstrumentStoreAsDefaultFieldTest disabled={true} isAccountInstrument={true} />);

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeDisabled();
    });

    it('enables checkbox when disabled prop is false', () => {
        render(<InstrumentStoreAsDefaultFieldTest disabled={false} isAccountInstrument={true} />);

        const checkbox = screen.getByRole('checkbox');

        expect(checkbox).toBeEnabled();
    });

    it('updates formik field value when disabled prop changes', () => {
        // const mockSetFieldValue = jest.fn();
        // const formikMock = { setFieldValue: mockSetFieldValue };

        const { rerender } = render(
            <InstrumentStoreAsDefaultFieldTest disabled={false} isAccountInstrument={true} />,
        );

        // Check that initially it's not called
        expect(paymentForm.setFieldValue).not.toHaveBeenCalled();

        rerender(<InstrumentStoreAsDefaultFieldTest disabled={true} isAccountInstrument={true} />);

        // Expect setFieldValue to have been called with the correct value
        expect(paymentForm.setFieldValue).toHaveBeenCalledWith(
            'shouldSetAsDefaultInstrument',
            false,
        );
    });

    it('triggers checkbox click event', () => {
        render(<InstrumentStoreAsDefaultFieldTest isAccountInstrument={true} />);

        const checkbox = screen.getByRole('checkbox');

        fireEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });
});
