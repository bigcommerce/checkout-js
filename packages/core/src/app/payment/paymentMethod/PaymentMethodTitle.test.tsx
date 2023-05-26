import { CheckoutService, createCheckoutService, StoreConfig } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider , PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
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
        render(<PaymentMethodTitleTest {...defaultProps} />);

        expect(screen.getByRole('heading', { name: defaultProps.method.config.displayName })).toBeInTheDocument();
    });

    it('renders name of payment method if it is credit card method', () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    method: 'credit-card',
                }}
            />,
        );

        expect(screen.getByRole('heading', { name: defaultProps.method.config.displayName })).toBeInTheDocument();
    });

    it('renders logo based on their method type', () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    method: PaymentMethodType.ApplePay,
                }}
            />,
        );

        const expectedPath = /^http/.test(LOGO_PATHS[PaymentMethodType.ApplePay])
            ? LOGO_PATHS[PaymentMethodType.ApplePay]
            : `${config.cdnPath}${LOGO_PATHS[PaymentMethodType.ApplePay]}`;

        expect(screen.getByRole('img')).toHaveAttribute('src',  expectedPath);
    });

    it('renders logo for based on their method id', () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    id: PaymentMethodId.AmazonPay,
                    method: 'widget',
                }}
            />,
        );

        expect(screen.getByRole('img')).toHaveAttribute('src', `${config.cdnPath}${LOGO_PATHS[PaymentMethodId.AmazonPay]}`);
    });

    it('renders logo based on their gateway id', () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    gateway: 'afterpay',
                    method: 'multi-option',
                }}
            />,
        );

        expect(screen.getByRole('img')).toHaveAttribute('src', `${config.cdnPath}${LOGO_PATHS.afterpay}`);
    });
    describe('renders both logo and name for some hosted payment methods', () => {
        it('renders both logo and name for Affirm hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Affirm,
                    }}
                />,
            );
    
            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');
    
            expect(logos).toBeInTheDocument();
    
            expect(names).toBeInTheDocument();
        });

        it('renders both logo and name for Afterpay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Afterpay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).toBeInTheDocument();
        });

        it('renders both logo and name for Klarna hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Klarna,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).toBeInTheDocument();
        });

        it('renders both logo and name for Quadpay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Quadpay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).toBeInTheDocument();
        });

        it('renders both logo and name for Sezzle hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Sezzle,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).toBeInTheDocument();
        });

        it('renders both logo and name for Zip hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Zip,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.getByRole('heading');

            expect(logos).toBeInTheDocument();
            expect(names).toBeInTheDocument();
        });
    });

    describe('renders custom text for certain hosted payment methods', () => {
        it('renders custom text for Affirm hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Affirm,
            };

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });

        it('renders custom text for Bolt hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Bolt,
            };

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });

        it('renders custom text for Klarna hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Klarna,
            };

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });

        it('renders custom text for Quadpay hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Quadpay,
            };

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });

        it('renders custom text for Sezzle hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Sezzle,
            };

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });

        it('renders custom text for Zip hosted payment methods', () => {
            const method = {
                ...defaultProps.method,
                id: PaymentMethodId.Zip,
            }

            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={method}
                />,
            );

            expect(screen.queryByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).not.toBeInTheDocument();
        });
    });

    describe('renders only logo for certain hosted payment methods', () => {
        it('renders only logo for AmazonPay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.AmazonPay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for ChasePay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.ChasePay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for Clearpay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Clearpay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for Humm hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Humm,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for y hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.Opy,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for ypalCommerce hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodId.PaypalCommerce,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for Barclaycard hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodType.Barclaycard,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for GooglePay hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodType.GooglePay,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
        it('renders only logo for Masterpass hosted payment methods', () => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        id: PaymentMethodType.Masterpass,
                    }}
                />,
            );

            const logos = screen.getByRole('img');
            const names = screen.queryByRole('heading');

            expect(logos).toBeInTheDocument();

            expect(names).not.toBeInTheDocument();
        });
    });

    it('renders a different logo for each methodId for Barclaycard', () => {
        const imageExtension = '.png';
        const imageFolder = '/img/payment-providers/';
        const method = PaymentMethodType.Barclaycard;
        const id = 'card';

        render(
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

        expect(screen.getByRole('img')).toHaveAttribute('src', expectedPath);
    });

    it('renders selected credit card type using information provided by hosted fields', () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                formValues={{
                    hostedForm: { cardType: 'mastercard' },
                    paymentProviderRadio: defaultProps.formValues.paymentProviderRadio,
                }}
                isSelected
            />,
        );
        expect(screen.getByTestId('credit-card-icon-mastercard')).toBeInTheDocument();
    });

    it('renders a different logo for braintreeVenmo methodId for Paypal', () => {
        const imageExtension = '.svg';
        const imageFolder = '/modules/checkout/braintreevenmo/images/';
        const method = PaymentMethodType.Paypal;
        const id = PaymentMethodId.BraintreeVenmo;
        const logoUrl = `${config.cdnPath}${imageFolder}braintree_venmo${imageExtension}`;

        render(
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

        expect(screen.getByRole('img')).toHaveAttribute('src', expectedPath);
    });

    it('renders selected credit card type using card number if not using hosted fields', () => {
        render(<PaymentMethodTitleTest {...defaultProps} isSelected />);

        expect(screen.getByTestId('credit-card-icon-visa')).toBeInTheDocument();
    });
    
    describe('renders only Checkout.com APMs logos based on their gateway id', () => {
        const renderCheckoutcomTitleComponent = (id: string) => {
            render(
                <PaymentMethodTitleTest
                    {...defaultProps}
                    method={{
                        ...defaultProps.method,
                        method: PaymentMethodId.Checkoutcom,
                        id,
                    }}
                />,
            );
        };
        const baseURL = (id: string) => `/img/payment-providers/checkoutcom_${id}.svg`;

        it('renders only Checkout.com SEPA logo', () => {
            renderCheckoutcomTitleComponent('sepa');

            expect(screen.getByRole('img')).toHaveAttribute(
                'src', `${config.cdnPath}${baseURL('sepa')}`,
            );
        });

        it('renders only Checkout.com oxxo logo', () => {
            renderCheckoutcomTitleComponent('oxxo');

            expect(screen.getByRole('img')).toHaveAttribute(
                'src', `${config.cdnPath}${baseURL('oxxo')}`,
            );
        });

        it('renders only Checkout.com boleto logo', () => {
            renderCheckoutcomTitleComponent('boleto');

            expect(screen.getByRole('img')).toHaveAttribute(
                'src', `${config.cdnPath}${baseURL('boleto')}`,
            );
        });

        it('renders only Checkout.com qpay logo', () => {
            renderCheckoutcomTitleComponent('qpay');

            expect(screen.getByRole('img')).toHaveAttribute(
                'src', `${config.cdnPath}${baseURL('qpay')}`,
            );

        });

        it('renders only Checkout.com credit card name', () => {
            renderCheckoutcomTitleComponent('credit_card');

            if(defaultProps.method.config.displayName) {
                expect(screen.getByRole('heading', { name: defaultProps.method.config.displayName })).toBeInTheDocument();
            }
        });

        it('renders only Checkout.com checkoutcom name', () => {
            renderCheckoutcomTitleComponent('checkoutcom');

            if(defaultProps.method.config.displayName) {
                expect(screen.getByRole('heading', { name: defaultProps.method.config.displayName })).toBeInTheDocument();
            }
        });
    });

    it("renders logo based on provider's config", () => {
        render(
            <PaymentMethodTitleTest
                {...defaultProps}
                method={{
                    ...defaultProps.method,
                    id: PaymentMethodId.Opy,
                    config: {
                        ...defaultProps.method.config,
                        logo: 'opy_gray.svg',
                    },
                }}
            />,
        );

        expect(screen.getByRole('img')).toHaveAttribute('src', `${config.cdnPath}/img/payment-providers/opy_gray.svg`);

    });

    it('renders default logo for Openpay', () => {
        defaultProps.method.id = PaymentMethodId.Opy;

        render(<PaymentMethodTitleTest {...defaultProps} />);

        expect(screen.getByRole('img')).toHaveAttribute('src',  `${config.cdnPath}/img/payment-providers/opy_default.svg`);
    });

    it('renders name for Visa Checkout', () => {
        const method = {
            ...defaultProps.method,
            method: PaymentMethodType.VisaCheckout,
        };

        render(<PaymentMethodTitleTest {...defaultProps} method={method} />);

        expect(screen.getByRole('heading', { name: getPaymentMethodName(localeContext.language)(method) })).toBeInTheDocument();
    });
});
