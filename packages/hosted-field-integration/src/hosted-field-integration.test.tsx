import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { getPaymentMethod, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import {
    HostedFieldPaymentMethodComponent,
    HostedFieldPaymentMethodComponentProps,
} from './hosted-field-integration';

describe('HostedFieldPaymentMethod', () => {
    let HostedFieldPaymentMethodTest: FunctionComponent<HostedFieldPaymentMethodComponentProps>;
    let defaultProps: HostedFieldPaymentMethodComponentProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        defaultProps = {
            cardExpiryId: 'card-expiry',
            cardNumberId: 'card-number',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
        };

        localeContext = createLocaleContext(getStoreConfig());

        HostedFieldPaymentMethodTest = (props) => (
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={localeContext}>
                    <HostedFieldPaymentMethodComponent {...props} />
                </LocaleContext.Provider>
            </Formik>
        );
    });

    it('renders fields and initializes payment method when component mounts', () => {
        render(<HostedFieldPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
        expect(screen.getByText('Credit Card Number')).toBeInTheDocument();
    });

    it('deinitializes payment method and does not render fields when user leaves payment process', () => {
        const { unmount } = render(<HostedFieldPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();
        expect(screen.getByText('Credit Card Number')).toBeInTheDocument();

        unmount();
        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
        expect(screen.queryByText('Credit Card Number')).not.toBeInTheDocument();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        const { unmount } = render(
            <HostedFieldPaymentMethodTest {...defaultProps} isInitializing />,
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
        unmount();
        render(<HostedFieldPaymentMethodTest {...defaultProps} isInitializing={false} />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders card number placeholder', () => {
        render(<HostedFieldPaymentMethodTest {...defaultProps} />);
        expect(screen.getByText(`Credit Card Number`)).toBeInTheDocument();
    });

    it('renders card expiry placeholder', () => {
        render(<HostedFieldPaymentMethodTest {...defaultProps} />);

        expect(screen.getByText(`Expiration`)).toBeInTheDocument();
    });

    it('renders card cvv placeholder if configured', () => {
        render(<HostedFieldPaymentMethodTest {...defaultProps} cardCodeId="card-code" />);
        expect(screen.getByText(`CVV`)).toBeInTheDocument();
    });

    it('renders postal code placeholder if configured', () => {
        render(<HostedFieldPaymentMethodTest {...defaultProps} postalCodeId="postal-code" />);

        expect(screen.getByText('Postal Code')).toBeInTheDocument();
    });

    it('renders wallet button placeholder if required', () => {
        render(
            <HostedFieldPaymentMethodTest
                {...defaultProps}
                walletButtons={
                    <label htmlFor="wallet-button" id="wallet-button">
                        Wallet Button
                    </label>
                }
            />,
        );

        expect(screen.getByText('Wallet Button')).toBeInTheDocument();
    });
});
