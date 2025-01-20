import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CreditCardPaymentMethodComponent } from '@bigcommerce/checkout/credit-card-integration';
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
import { render } from '@bigcommerce/checkout/test-utils';

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

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'fawry', gateway: PaymentMethodId.Checkoutcom };
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
        PaymentMethodTest = (props) => (
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
        const container = mount(<PaymentMethodTest {...defaultProps} />);

        expect(container.find(CreditCardPaymentMethodComponent)).toHaveLength(1);
    });

    it('matches snapshot', () => {
        render(<PaymentMethodTest {...defaultProps} />);

        expect(render(<PaymentMethodTest {...defaultProps} />)).toMatchSnapshot();
    });

    it('renders as oxxo payment method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={alternateMethodA} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method: alternateMethodA,
            }),
        );
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
            }),
        );
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('renders as qpay payment method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={alternateMethodB} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method: alternateMethodB,
            }),
        );
    });

    it('initializes fawry payment method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={fawryMethod} />);
        const component = container.find(CreditCardPaymentMethodComponent);

        component.prop('initializePayment')({
            methodId: fawryMethod.id,
            gatewayId: fawryMethod.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'fawry',
            }),
        );
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

        expect(container.firstChild).toBeNull();
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

        expect(container.firstChild).not.toBeNull();
    });
});
