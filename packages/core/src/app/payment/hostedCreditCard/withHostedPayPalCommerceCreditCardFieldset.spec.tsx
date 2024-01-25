import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    HostedFieldType,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik, FormikProps } from 'formik';
import { last, merge, noop } from 'lodash';
import React, { ComponentType, FunctionComponent, ReactNode } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import {
    CardInstrumentFieldsetValues,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
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
import {
    WithHostedCreditCardFieldsetProps,
    WithInjectedHostedCreditCardFieldsetProps,
} from './withHostedCreditCardFieldset';
import withHostedPayPalCommerceCreditCardFieldset from './withHostedPayPalCommerceCreditCardFieldset';

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

describe('withHostedPayPalCommerceCreditCardFieldset', () => {
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

        DecoratedPaymentMethod = withHostedPayPalCommerceCreditCardFieldset(InnerPaymentMethod);

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
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);

        expect(container.find(HostedCreditCardFieldset)).toHaveLength(1);
    });

    it('does not render hosted credit card fieldset if feature is not enabled', () => {
        const container = mount(
            <DecoratedPaymentMethodTest
                {...defaultProps}
                method={merge({}, getPaymentMethod(), {
                    config: {
                        isHostedFormEnabled: false,
                    },
                })}
            />,
        );

        expect(container.find(HostedCreditCardFieldset)).toHaveLength(0);
    });

    it('passes hosted form configuration to inner component', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');

        expect(await getHostedFormOptions()).toEqual({
            fields: {
                cardCode: { accessibilityLabel: 'CVV', containerId: 'authorizenet-ccCvv' },
                cardExpiry: {
                    accessibilityLabel: 'Expiration',
                    containerId: 'authorizenet-ccExpiry',
                    placeholder: 'MM / YY',
                },
                cardName: {
                    accessibilityLabel: 'Name on Card',
                    containerId: 'authorizenet-ccName',
                },
                cardNumber: {
                    accessibilityLabel: 'Credit Card Number',
                    containerId: 'authorizenet-ccNumber',
                },
            },
            styles: {
                default: expect.any(Object),
                error: expect.any(Object),
                focus: expect.any(Object),
            },
            onBlur: expect.any(Function),
            onCardTypeChange: expect.any(Function),
            onEnter: expect.any(Function),
            onFocus: expect.any(Function),
            onValidate: expect.any(Function),
        });
    });

    it('passes hosted verification form options to inner component when there is selected instrument', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');

        expect(
            await getHostedFormOptions({
                ...getCardInstrument(),
                trustedShippingAddress: false,
            }),
        ).toEqual({
            fields: {
                cardCodeVerification: {
                    accessibilityLabel: 'CVV',
                    containerId: 'authorizenet-ccCvv',
                    instrumentId: getCardInstrument().bigpayToken,
                },
                cardNumberVerification: {
                    accessibilityLabel: 'Credit Card Number',
                    containerId: 'authorizenet-ccNumber',
                    instrumentId: getCardInstrument().bigpayToken,
                },
                cardExpiryVerification: {
                    accessibilityLabel: 'optimized_checkout.payment.credit_card_expiry_label',
                    containerId: 'authorizenet-ccExpiry',
                    instrumentId: '123'
                }
            },
            styles: {
                default: expect.any(Object),
                error: expect.any(Object),
                focus: expect.any(Object),
            },
            onBlur: expect.any(Function),
            onCardTypeChange: expect.any(Function),
            onEnter: expect.any(Function),
            onFocus: expect.any(Function),
            onValidate: expect.any(Function),
        });
    });

    it('passes styling properties to hosted form', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');

        expect(await getHostedFormOptions()).toEqual(
            expect.objectContaining({
                styles: {
                    default: { color: 'rgb(0, 0, 0)' },
                    error: { color: 'rgb(255, 0, 0)' },
                    focus: { color: 'rgb(0, 0, 255)' },
                },
            }),
        );

        expect(getCreditCardInputStyles).toHaveBeenCalledWith('authorizenet-ccNumber', [
            'color',
            'fontFamily',
            'fontSize',
            'fontWeight',
        ]);
        expect(getCreditCardInputStyles).toHaveBeenCalledWith(
            'authorizenet-ccNumber',
            ['color', 'fontFamily', 'fontSize', 'fontWeight'],
            CreditCardInputStylesType.Error,
        );
        expect(getCreditCardInputStyles).toHaveBeenCalledWith(
            'authorizenet-ccNumber',
            ['color', 'fontFamily', 'fontSize', 'fontWeight'],
            CreditCardInputStylesType.Focus,
        );
    });

    it('passes error messages from hosted form to Formik form', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');
        const { onValidate } = await getHostedFormOptions();

        onValidate({
            isValid: false,
            errors: {
                cardCode: [],
                cardExpiry: [],
                cardName: [],
                cardNumber: [
                    {
                        fieldType: 'cardNumber',
                        type: 'required',
                        message: 'Card number is required',
                    },
                ],
            },
        });

        container.update();

        expect(
            (last(formikRender.mock.calls)![0].values as HostedCreditCardFieldsetValues).hostedForm
                .errors,
        ).toEqual(
            expect.objectContaining({
                cardNumber: 'required',
            }),
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(last(formikRender.mock.calls)![0].touched).toEqual(
            expect.objectContaining({
                hostedForm: {
                    errors: {
                        cardNumber: true,
                    },
                },
            }),
        );
    });

    it('passes card type from hosted form to Formik form', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');
        const { onCardTypeChange } = await getHostedFormOptions();

        onCardTypeChange({ cardType: 'mastercard' });

        container.update();

        expect(
            (last(formikRender.mock.calls)![0].values as HostedCreditCardFieldsetValues).hostedForm
                .cardType,
        ).toBe('mastercard');
    });

    it('highlights hosted field in focus', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');
        const { onFocus } = await getHostedFormOptions();

        act(() => {
            onFocus({ fieldType: 'cardNumber' as HostedFieldType });
        });

        container.update();

        expect(container.find(HostedCreditCardFieldset).prop('focusedFieldType')).toBe(
            'cardNumber',
        );
    });

    it('clears highlight if hosted field in no longer in focus', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');
        const { onBlur } = await getHostedFormOptions();

        onBlur({ fieldType: 'cardNumber' as HostedFieldType });

        container.update();

        expect(container.find(HostedCreditCardFieldset).prop('focusedFieldType')).toBeUndefined();
    });

    it('submits form when enter key is pressed', async () => {
        const container = mount(<DecoratedPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = container
            .find(InnerPaymentMethod)
            .prop('getHostedFormOptions');
        const { onEnter } = await getHostedFormOptions();

        onEnter({ fieldType: 'cardNumber' as HostedFieldType });

        container.update();

        expect(formikProps.submitCount).toBe(1);
        expect(formContext.setSubmitted).toHaveBeenCalled();
    });
});
