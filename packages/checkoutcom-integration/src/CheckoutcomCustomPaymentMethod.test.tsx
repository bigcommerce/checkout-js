import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentMethodId,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import CheckoutcomCustomPaymentMethod from './CheckoutcomCustomPaymentMethod';

describe('when using Checkoutcom payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let fawryMethod: PaymentMethod;
    let idealMethod: PaymentMethod;
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
        idealMethod = {
            ...getPaymentMethod(),
            id: 'ideal',
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

    it('initializes method with required config', () => {
        render(<PaymentMethodTest {...defaultProps} />);
        expect(initializePayment).toHaveBeenCalled();
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            methodId: method.id,
            gatewayId: method.gateway,
        });
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            methodId: method.id,
            gatewayId: method.gateway,
        });
    });

    it('renders as qpay payment method', () => {
        render(<PaymentMethodTest {...defaultProps} method={alternateMethodB} />);
        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            methodId: 'qpay',
            gatewayId: method.gateway,
        });
    });

    it('initializes fawry payment method', () => {
        render(<PaymentMethodTest {...defaultProps} method={fawryMethod} />);

        expect(initializePayment.mock.calls[0][0]).toMatchObject({
            methodId: 'fawry',
            gatewayId: method.gateway,
        });
    });

    it('should be deinitialized with the required config', () => {
        render(<PaymentMethodTest {...defaultProps} />).unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'checkoutcom',
            methodId: 'fawry',
        });
    });

    it('catches an error during failed initialization of initializePayment', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('error'));
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('does not render the fields when ideal experiment is on', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                features: {
                    ...getStoreConfig().checkoutSettings.features,
                    'PI-2979.checkoutcom_enable_ideal_hosted_page': true,
                },
            },
        });

        const { container } = render(<PaymentMethodTest {...defaultProps} method={idealMethod} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the fields for other APMs when ideal experiment is on', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                features: {
                    ...getStoreConfig().checkoutSettings.features,
                    'PI-2979.checkoutcom_enable_ideal_hosted_page': true,
                },
            },
        });

        const { container } = render(<PaymentMethodTest {...defaultProps} method={fawryMethod} />);

        expect(container).not.toBeEmptyDOMElement();
    });
});
