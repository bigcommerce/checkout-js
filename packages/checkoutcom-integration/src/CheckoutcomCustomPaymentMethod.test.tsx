import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutcomCustomPaymentMethod from './CheckoutcomCustomPaymentMethod';

describe('when using Checkoutcom payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let fawryMethod: PaymentMethod;
    let alternateMethodA: PaymentMethod;
    let alternateMethodB: PaymentMethod;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'fawry', gateway: PaymentMethodId.Checkoutcom };
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        fawryMethod = {
            ...getPaymentMethod(),
            id: 'fawry',
            gateway: PaymentMethodId.Checkoutcom,
        };
        alternateMethodA = {
            ...getPaymentMethod(),
            id: 'oxxo',
            gateway: PaymentMethodId.Checkoutcom,
        };
        alternateMethodB = {
            ...getPaymentMethod(),
            id: 'qpay',
            gateway: PaymentMethodId.Checkoutcom,
        };
        PaymentMethodTest = (props = defaultProps) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <CheckoutcomCustomPaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders as credit card payment method component', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.paymentMethod--creditCard')).toBeInTheDocument();
    });

    it('renders as oxxo payment method', () => {
        render(<PaymentMethodTest {...defaultProps} method={alternateMethodA} />);
        expect(
            screen.getByText(
                localeContext.language.translate('payment.checkoutcom_document_label_oxxo'),
            ),
        ).toBeInTheDocument();
    });

    it('renders APM field and initializes method with required config', () => {
        render(<PaymentMethodTest {...defaultProps} />);
        expect(initializePayment).toHaveBeenCalled();
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            gatewayId: method.gateway,
            methodId: method.id,
        });
        expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    });

    it('renders the fields when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    });

    it('renders the fields when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    });

    it('renders as qpay fields', () => {
        render(<PaymentMethodTest {...defaultProps} method={alternateMethodB} />);
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            methodId: 'qpay',
            gatewayId: method.gateway,
        });
        expect(screen.getByText('National ID')).toBeInTheDocument();
    });

    it('renders fawry fields', () => {
        render(<PaymentMethodTest {...defaultProps} method={fawryMethod} />);

        expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    });

    it('should be deinitialized with the required config and not render the fields', () => {
        render(<PaymentMethodTest {...defaultProps} />).unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'checkoutcom',
            methodId: 'fawry',
        });
        expect(screen.queryByText('Mobile Number')).not.toBeInTheDocument();
    });

    it('throws error during failed initialization of initializePayment', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('error'));
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
