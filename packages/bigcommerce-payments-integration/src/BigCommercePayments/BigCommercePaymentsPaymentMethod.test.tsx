import { type AccountInstrument, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { act } from '@bigcommerce/checkout/test-utils';

import { getBigCommercePaymentsMethod } from '../mocks/paymentMethods.mock';

import BigCommercePaymentsPaymentMethod from './BigCommercePaymentsPaymentMethod';

describe('BigCommercePaymentsPaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const paymentForm = getPaymentFormServiceMock();
    const localeContext = createLocaleContext(getStoreConfig());

    const props = {
        method: getBigCommercePaymentsMethod(),
        checkoutService,
        checkoutState,

        paymentForm,
        language: localeContext.language,
        onUnhandledError: jest.fn(),
    };

    const accountInstrument: AccountInstrument = {
        bigpayToken: '31415',
        provider: 'bigcommerce_payments',
        externalId: 'test@external-id.com',
        trustedShippingAddress: false,
        defaultInstrument: false,
        method: 'paypal',
        type: 'account',
    };

    const BigCommercePaymentsPaymentMethodMock: FunctionComponent<PaymentMethodProps> = (
        paymentProps: PaymentMethodProps,
    ) => {
        return (
            <Formik initialValues={{}} onSubmit={noop}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <LocaleContext.Provider value={localeContext}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <BigCommercePaymentsPaymentMethod {...paymentProps} />
                        </PaymentFormContext.Provider>
                    </LocaleContext.Provider>
                </CheckoutContext.Provider>
            </Formik>
        );
    };

    it('renders nothing if Payment Data is not Required', () => {
        const mockChild = <div>test child</div>;
        const localProps = {
            ...props,
            checkoutState: {
                ...checkoutState,
                data: {
                    ...checkoutState.data,
                    isPaymentDataRequired: jest.fn().mockReturnValue(false),
                },
            },
            children: mockChild,
        };
        const { container } = render(<BigCommercePaymentsPaymentMethodMock {...localProps} />);

        expect(container).toBeEmptyDOMElement();
    });

    describe('store instruments feature is available', () => {
        beforeEach(() => {
            props.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([accountInstrument]);

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService.getState().data, 'isPaymentDataRequired').mockReturnValue(
                true,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('shows instruments fieldset when there is at least one stored instrument with trusted shipping address', async () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                {
                    ...accountInstrument,
                    trustedShippingAddress: true,
                },
            ]);

            render(<BigCommercePaymentsPaymentMethodMock {...props} />);

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });

            expect(screen.getByText('test@external-id.com')).toBeInTheDocument();
        });

        it('shows save instrument checkbox for registered customers', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<BigCommercePaymentsPaymentMethodMock {...props} />);

            expect(
                screen.getByText('Save this account for future transactions'),
            ).toBeInTheDocument();
        });

        it('should confirm instrument if untrusted shipping address is selected', () => {
            render(<BigCommercePaymentsPaymentMethodMock {...props} />);

            expect(
                screen.getByText(/We noticed this is a new shipping address/i),
            ).toBeInTheDocument();
        });

        it('should hide instrument if isComplete is true', () => {
            props.method.initializationData.isComplete = true;

            render(<BigCommercePaymentsPaymentMethodMock {...props} />);

            expect(screen.queryByText('test@external-id.com')).not.toBeInTheDocument();
        });

        it('should not load instruments if isComplete is true', () => {
            props.method.initializationData.isComplete = true;

            render(<BigCommercePaymentsPaymentMethodMock {...props} />);

            expect(checkoutService.loadInstruments).not.toHaveBeenCalled();
        });
    });
});
