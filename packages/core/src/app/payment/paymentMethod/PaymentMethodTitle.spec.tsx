import { CheckoutService, createCheckoutService, StoreConfig } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { CreditCardIconList } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';

import getPaymentMethodName from './getPaymentMethodName';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodTitle, { PaymentMethodTitleProps } from './PaymentMethodTitle';
import PaymentMethodType from './PaymentMethodType';

describe('PaymentMethodTitle', () => {
    let PaymentMethodTitleTest: FunctionComponent<
        PaymentMethodTitleProps & { formValues: PaymentFormValues }
    >;
    let checkoutService: CheckoutService;
    let config: StoreConfig;
    let defaultProps: PaymentMethodTitleProps & { formValues: PaymentFormValues };
    let localeContext: LocaleContextType;

    const LOGO_PATHS: { [key: string]: string } = {
        'paypal-credit': '/img/payment-providers/paypal_commerce_logo_letter.svg',
        'visa-checkout': '/img/payment-providers/visa-checkout.png',
        afterpay: '/img/payment-providers/afterpay-badge-blackonmint.png',
        amazonpay: '/img/payment-providers/amazon-header.png',
        applepay: '/modules/checkout/applepay/images/applepay-header@2x.png',
        chasepay: '/img/payment-providers/chase-pay.png',
        googlepay: '/img/payment-providers/google-pay.png',
        humm: '/img/payment-providers/humm-checkout-header.png',
        klarna: '/img/payment-providers/klarna-header.png',
        laybuy: '/img/payment-providers/laybuy-checkout-header.png',
        masterpass: 'https://masterpass.com/dyn/img/acc/global/mp_mark_hor_blk.svg',
        paypal: '/img/payment-providers/paypalpaymentsprouk.png',
        quadpay: '/img/payment-providers/quadpay.png',
        sezzle: '/img/payment-providers/sezzle-checkout-header.png',
        zip: '/img/payment-providers/zip.png',
        paypalcommerce: '/img/payment-providers/paypal_commerce_logo.svg',
    };

    beforeEach(() => {
        defaultProps = {
            formValues: {
                ccExpiry: '10 / 22',
                ccName: 'Good Shopper',
                ccNumber: '4111 1111 1111 1111',
                paymentProviderRadio: getPaymentMethod().id,
            },
            method: getPaymentMethod(),
        };

        config = getStoreConfig();
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(config);

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(config);

        PaymentMethodTitleTest = ({ formValues, ...props }) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={formValues} onSubmit={noop}>
                        <PaymentMethodTitle {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders name of payment method if it does not have logo', () => {
        const component = mount(<PaymentMethodTitleTest {...defaultProps} />);

        expect(component.find('[data-test="payment-method-name"]').text()).toEqual(
            defaultProps.method.config.displayName,
        );
    });

    it('renders name of payment method if it is credit card method', () => {
        const component = mount(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    method: 'credit-card',
                }}
            />,
        );

        expect(component.find('[data-test="payment-method-name"]').text()).toEqual(
            defaultProps.method.config.displayName,
        );
    });

    it('renders logo based on their method type', () => {
        const methodTypes = [
            PaymentMethodType.ApplePay,
            PaymentMethodType.Chasepay,
            PaymentMethodType.GooglePay,
            PaymentMethodType.Masterpass,
            PaymentMethodType.Paypal,
            PaymentMethodType.PaypalCredit,
            PaymentMethodType.VisaCheckout,
        ];

        methodTypes.forEach((method) => {
            const component = mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        method,
                    }}
                />,
            );

            const expectedPath = /^http/.test(LOGO_PATHS[method])
                ? LOGO_PATHS[method]
                : `${config.cdnPath}${LOGO_PATHS[method]}`;

            expect(component.find('[data-test="payment-method-logo"]').prop('src')).toEqual(
                expectedPath,
            );
        });
    });

    it('renders logo for based on their method id', () => {
        const methods = [
            { id: PaymentMethodId.AmazonPay, method: 'widget' },
            { id: PaymentMethodId.Klarna, method: 'widget' },
            { id: PaymentMethodId.PaypalCommerce, method: 'widget' },
        ];

        methods.forEach((method) => {
            const component = mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        ...method,
                    }}
                />,
            );

            expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
                `${config.cdnPath}${LOGO_PATHS[method.id]}`,
            );
        });
    });

    it('renders logo based on their gateway id', () => {
        const component = mount(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    gateway: 'afterpay',
                    method: 'multi-option',
                }}
            />,
        );

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}${LOGO_PATHS.afterpay}`,
        );
    });

    it('renders both logo and name for certain hosted payment methods', () => {
        const methodIds = [
            PaymentMethodId.Affirm,
            PaymentMethodId.Afterpay,
            PaymentMethodId.Clearpay,
            PaymentMethodId.Klarna,
            PaymentMethodId.Quadpay,
            PaymentMethodId.Sezzle,
            PaymentMethodId.Zip,
        ];

        methodIds.forEach((id) => {
            const component = mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id,
                    }}
                />,
            );

            expect(component.find('[data-test="payment-method-logo"]')).toHaveLength(1);

            expect(component.find('[data-test="payment-method-name"]')).toHaveLength(1);
        });
    });

    it('renders custom text for certain hosted payment methods', () => {
        const methodIds = [
            PaymentMethodId.Affirm,
            PaymentMethodId.Bolt,
            PaymentMethodId.Klarna,
            PaymentMethodId.Quadpay,
            PaymentMethodId.Sezzle,
            PaymentMethodId.Zip,
        ];

        methodIds.forEach((id) => {
            const method = { ...defaultProps.method, id };
            const component = mount(<PaymentMethodTitleTest {...defaultProps} method={method} />);

            expect(component.find('[data-test="payment-method-name"]').text()).not.toEqual(
                getPaymentMethodName(localeContext.language)(method),
            );
        });
    });

    it('renders only logo for certain hosted payment methods', () => {
        const methodIds = [
            PaymentMethodId.AmazonPay,
            PaymentMethodId.ChasePay,
            PaymentMethodId.Humm,
            PaymentMethodId.Opy,
            PaymentMethodId.PaypalCommerce,
            PaymentMethodType.Barclaycard,
            PaymentMethodType.GooglePay,
            PaymentMethodType.Masterpass,
        ];

        methodIds.forEach((id) => {
            const component = mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id,
                    }}
                />,
            );

            expect(component.find('[data-test="payment-method-logo"]')).toHaveLength(1);

            expect(component.find('[data-test="payment-method-name"]')).toHaveLength(0);
        });
    });

    it('renders a different logo for each methodId for Barclaycard', () => {
        const imageExtension = '.png';
        const imageFolder = '/img/payment-providers/';
        const method = PaymentMethodType.Barclaycard;
        const id = 'card';

        const component = mount(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    id,
                    method,
                }}
            />,
        );

        const expectedPath = `${
            config.cdnPath
        }${imageFolder}${method}_${id.toLowerCase()}${imageExtension}`;

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toEqual(
            expectedPath,
        );
    });

    it('renders selected credit card type using information provided by hosted fields', () => {
        const component = mount(
            <PaymentMethodTitleTest
                {...defaultProps}
                formValues={{
                    hostedForm: { cardType: 'mastercard' },
                    paymentProviderRadio: defaultProps.formValues.paymentProviderRadio,
                }}
                isSelected
            />,
        );

        expect(component.find(CreditCardIconList).prop('selectedCardType')).toBe('mastercard');
    });

    it('renders a different logo for braintreeVenmo methodId for Paypal', () => {
        const imageExtension = '.svg';
        const imageFolder = '/modules/checkout/braintreevenmo/images/';
        const method = PaymentMethodType.Paypal;
        const id = PaymentMethodId.BraintreeVenmo;
        const logoUrl = `${config.cdnPath}${imageFolder}braintree_venmo${imageExtension}`;

        const component = mount(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    id,
                    method,
                    logoUrl,
                }}
            />,
        );

        const expectedPath = `${config.cdnPath}${imageFolder}braintree_venmo${imageExtension}`;

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toEqual(
            expectedPath,
        );
    });

    it('renders selected credit card type using card number if not using hosted fields', () => {
        const component = mount(<PaymentMethodTitleTest {...defaultProps} isSelected />);

        expect(component.find(CreditCardIconList).prop('selectedCardType')).toBe('visa');
    });

    it('renders only Checkout.com APMs logos based on their gateway id', () => {
        const checkoutcomTitleComponent = (id: string) =>
            mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        method: PaymentMethodId.Checkoutcom,
                        id,
                    }}
                />,
            );
        const baseURL = (id: string) => `/img/payment-providers/checkoutcom_${id}.svg`;

        let component = checkoutcomTitleComponent('sepa');

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}${baseURL('sepa')}`,
        );

        component = checkoutcomTitleComponent('oxxo');

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}${baseURL('oxxo')}`,
        );

        component = checkoutcomTitleComponent('boleto');

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}${baseURL('boleto')}`,
        );

        component = checkoutcomTitleComponent('qpay');

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}${baseURL('qpay')}`,
        );

        component = checkoutcomTitleComponent('credit_card');

        expect(component.find('[data-test="payment-method-name"]').text()).toEqual(
            defaultProps.method.config.displayName,
        );

        component = checkoutcomTitleComponent('checkoutcom');

        expect(component.find('[data-test="payment-method-name"]').text()).toEqual(
            defaultProps.method.config.displayName,
        );
    });

    it("renders logo based on provider's config", () => {
        const methods = [
            {
                id: PaymentMethodId.Opy,
                config: {
                    ...defaultProps.method.config,
                    logo: 'opy_gray.svg',
                },
            },
        ];

        methods.forEach((method) => {
            const component = mount(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        ...method,
                    }}
                />,
            );

            expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
                `${config.cdnPath}/img/payment-providers/${method.config.logo}`,
            );
        });
    });

    it('renders default logo for Openpay', () => {
        defaultProps.method.id = PaymentMethodId.Opy;

        const component = mount(<PaymentMethodTitleTest {...defaultProps} />);

        expect(component.find('[data-test="payment-method-logo"]').prop('src')).toBe(
            `${config.cdnPath}/img/payment-providers/opy_default.svg`,
        );
    });

    it('renders name for Visa Checkout', () => {
        const method = {
            ...defaultProps.method,
            method: PaymentMethodType.VisaCheckout,
        };

        const component = mount(<PaymentMethodTitleTest {...defaultProps} method={method} />);

        expect(component.find('[data-test="payment-method-name"]').text()).toEqual(
            getPaymentMethodName(localeContext.language)(method),
        );
    });
});
