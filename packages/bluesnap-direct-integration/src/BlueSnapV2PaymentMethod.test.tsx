import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentFormContext,
    type PaymentFormService,
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapV2PaymentMethod from './BlueSnapV2PaymentMethod';

describe('when using BlueSnapV2 payment', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let BlueSnapV2PaymentMethodTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        defaultProps = {
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
            method: {
                ...getPaymentMethod(),
                id: 'mastercard',
                gateway: PaymentMethodId.BlueSnapV2,
            },
        };
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        BlueSnapV2PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BlueSnapV2PaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders modal that hosts bluesnap payment page', () => {
        render(<BlueSnapV2PaymentMethodTest />);

        const initializeOptions = initializePayment.mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2?.onLoad(document.createElement('iframe'), jest.fn());
        });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('renders modal and appends bluesnap payment page', async () => {
        render(<BlueSnapV2PaymentMethodTest />);

        const initializeOptions = initializePayment.mock.calls[0][0];
        const iframe = document.createElement('iframe');

        iframe.setAttribute('data-test', 'my-iframe');

        act(() => initializeOptions.bluesnapv2?.onLoad(iframe, jest.fn()));

        await new Promise((resolve) => process.nextTick(resolve));

        const user = userEvent.setup();

        await user.click(screen.getByRole('dialog'));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
        expect(screen.getByTestId('my-iframe')).toBeInTheDocument();
    });

    it('renders modal but does not append bluesnap payment page because is empty', async () => {
        render(<BlueSnapV2PaymentMethodTest />);

        const initializeOptions = initializePayment.mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2?.onLoad(undefined, jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByTestId('modal-body')).not.toBeInTheDocument();
        expect(screen.queryByTestId('my-iframe')).not.toBeInTheDocument();
    });

    it('cancels payment flow if user chooses to close modal', async () => {
        const cancelBlueSnapV2Payment = jest.fn();

        render(<BlueSnapV2PaymentMethodTest />);

        const initializeOptions = initializePayment.mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2?.onLoad(
                document.createElement('iframe'),
                cancelBlueSnapV2Payment,
            );
        });

        const user = userEvent.setup();

        await new Promise((resolve) => process.nextTick(resolve));
        await user.click(screen.getByText('Close'));

        expect(cancelBlueSnapV2Payment).toHaveBeenCalledTimes(1);
    });
});
