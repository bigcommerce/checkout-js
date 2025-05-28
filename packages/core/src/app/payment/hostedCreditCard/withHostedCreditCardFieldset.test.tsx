import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { Formik, FormikProps } from 'formik';
import { merge, noop } from 'lodash';
import React, { ComponentType, FunctionComponent, ReactNode } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import {
    CardInstrumentFieldsetValues,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';
import { FormContext, FormContextType } from '@bigcommerce/checkout/ui';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { CreditCardInputStylesType, getCreditCardInputStyles } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';
import HostedCreditCardFieldsetValues from '../paymentMethod/HostedCreditCardFieldsetValues';
import { getCardInstrument } from '../storedInstrument/instruments.mock';

import HostedCreditCardFieldset from './HostedCreditCardFieldset';
import withHostedCreditCardFieldset, {
    WithHostedCreditCardFieldsetProps,
    WithInjectedHostedCreditCardFieldsetProps,
} from './withHostedCreditCardFieldset';

jest.mock('../creditCard', () => ({
    ...jest.requireActual('../creditCard'),
    getCreditCardInputStyles: jest.fn<
        ReturnType<typeof getCreditCardInputStyles>,
        Parameters<typeof getCreditCardInputStyles>
    >((_containerId, _fieldType, type) => {
        if (type === CreditCardInputStylesType.Error) {
            return Promise.resolve({ color: 'rgb(255, 0, 0)' });
        }

        if (type === CreditCardInputStylesType.Focus) {
            return Promise.resolve({ color: 'rgb(0, 0, 255)' });
        }

        return Promise.resolve({ color: 'rgb(0, 0, 0)' });
    }),
}));

describe('withHostedCreditCardFieldset', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: WithHostedCreditCardFieldsetProps;
    let formContext: FormContextType;
    let formikRender: jest.Mock<
        ReactNode,
        [FormikProps<HostedCreditCardFieldsetValues & CardInstrumentFieldsetValues>]
    >;
    let formikProps: FormikProps<HostedCreditCardFieldsetValues & CardInstrumentFieldsetValues>;
    let initialValues: HostedCreditCardFieldsetValues & CardInstrumentFieldsetValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let DecoratedPaymentMethod: ComponentType<WithHostedCreditCardFieldsetProps>;
    let DecoratedPaymentMethodTest: FunctionComponent<WithHostedCreditCardFieldsetProps>;
    let InnerPaymentMethod: ComponentType<
        WithHostedCreditCardFieldsetProps & WithInjectedHostedCreditCardFieldsetProps
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: merge({}, getPaymentMethod(), {
                config: {
                    isHostedFormEnabled: true,
                },
            }),
        };

        initialValues = {
            hostedForm: {},
            instrumentId: '',
        };

        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        formContext = {
            isSubmitted: false,
            setSubmitted: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getPaymentMethod').mockReturnValue(defaultProps.method);

        InnerPaymentMethod = jest.fn(
            ({ getHostedStoredCardValidationFieldset = noop, hostedFieldset }) => {
                return (
                    <>
                        {hostedFieldset}
                        {getHostedStoredCardValidationFieldset()}
                    </>
                );
            },
        );

        DecoratedPaymentMethod = withHostedCreditCardFieldset(InnerPaymentMethod);

        DecoratedPaymentMethodTest = (props) => {
            formikRender = jest.fn((renderProps) => {
                formikProps = renderProps;

                return <DecoratedPaymentMethod {...props} />;
            });

            return (
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <LocaleContext.Provider value={localeContext}>
                            <FormContext.Provider value={formContext}>
                                <Formik
                                    initialValues={initialValues}
                                    onSubmit={noop}
                                    render={formikRender}
                                />
                            </FormContext.Provider>
                        </LocaleContext.Provider>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            );
        };
    });

    it('renders hosted credit card fieldset', () => {
        render(<DecoratedPaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Credit Card Number')).toBeInTheDocument();
        expect(screen.getByText('Expiration')).toBeInTheDocument();
        expect(screen.getByText('Name on Card')).toBeInTheDocument();
        expect(screen.getByText('CVV')).toBeInTheDocument();
    });

    it('does not render hosted credit card fieldset if feature is not enabled', () => {
        render(
            <DecoratedPaymentMethodTest
                {...defaultProps}
                method={merge({}, getPaymentMethod(), {
                    config: {
                        isHostedFormEnabled: false,
                    },
                })}
            />,
        );

        expect(screen.queryByText('Credit Card Number')).not.toBeInTheDocument();
        expect(screen.queryByText('Expiration')).not.toBeInTheDocument();
        expect(screen.queryByText('Name on Card')).not.toBeInTheDocument();
        expect(screen.queryByText('CVV')).not.toBeInTheDocument();
    });
});
