import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    HostedFieldType,
    PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent, useEffect } from 'react';
import { act } from 'react-dom/test-utils';

import { CreditCardPaymentMethodComponent } from '@bigcommerce/checkout/credit-card-integration';
import {
    CreditCardCustomerCodeField,
    CreditCardInputStylesType,
    getCreditCardInputStyles,
} from '@bigcommerce/checkout/instrument-utils';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCardInstrument,
    getCart,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import { HostedCreditCardFieldset } from './components';

import { HostedCreditCardPaymentMethod } from '.';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@bigcommerce/checkout/credit-card-integration', () => ({
    ...jest.requireActual('@bigcommerce/checkout/credit-card-integration'),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreditCardPaymentMethodComponent: jest.fn(({ cardFieldset, initializePayment, method }) => {
        useEffect(() => {
            initializePayment({
                methodId: method.id,
                gatewayId: method.gateway,
            });
        });

        return <div>{cardFieldset}</div>;
    }),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@bigcommerce/checkout/instrument-utils', () => ({
    ...jest.requireActual('@bigcommerce/checkout/instrument-utils'),
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

describe('HostedCreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let HostedCreditCardPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        paymentForm = getPaymentFormServiceMock();

        const { language } = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: getPaymentMethod(),
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        HostedCreditCardPaymentMethodTest = (props: PaymentMethodProps) => (
            <Formik initialValues={{}} onSubmit={noop}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <HostedCreditCardPaymentMethod {...props} />
                </LocaleContext.Provider>
            </Formik>
        );

        const placeholderElement = document.createElement('div');

        jest.spyOn(document, 'getElementById').mockReturnValue(placeholderElement);
    });

    it('initializes method with hosted form options', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(component.find(CreditCardPaymentMethodComponent)).toHaveLength(1);
        expect(initializePayment).toHaveBeenCalledWith({
            creditCard: {
                form: {
                    fields: {
                        cardCode: {
                            accessibilityLabel: 'CVV',
                            containerId: 'authorizenet-ccCvv',
                        },
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
                },
            },
            gatewayId: undefined,
            methodId: 'authorizenet',
        });
    });

    it('injects hosted form properties to credit card payment method component', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const creditCardComponent = component.find(CreditCardPaymentMethodComponent);

        expect(creditCardComponent.prop('cardFieldset')).toMatchSnapshot();
        expect(creditCardComponent.prop('cardValidationSchema')).toBeDefined();
        expect(creditCardComponent.prop('deinitializePayment')).toBe(
            checkoutService.deinitializePayment,
        );
        expect(creditCardComponent.prop('getStoredCardValidationFieldset')).toBeDefined();
        expect(creditCardComponent.prop('storedCardValidationSchema')).toBeDefined();
    });

    it('passes styling properties to hosted form', () => {
        mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

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
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onValidate } = await getHostedFormOptions();

        if (!onValidate) throw new Error('onValidate undefined');

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

        component.update();

        const { setFieldValue } = paymentForm;

        expect(setFieldValue).toHaveBeenCalledTimes(4);
        expect(setFieldValue).toHaveBeenCalledWith('hostedForm.errors.cardCode', '');
        expect(setFieldValue).toHaveBeenCalledWith('hostedForm.errors.cardExpiry', '');
        expect(setFieldValue).toHaveBeenCalledWith('hostedForm.errors.cardName', '');
        expect(setFieldValue).toHaveBeenLastCalledWith('hostedForm.errors.cardNumber', 'required');
    });

    it('passes card type from hosted form to Formik form', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onCardTypeChange } = await getHostedFormOptions();

        if (!onCardTypeChange) throw new Error('onCardTypeChange undefined');

        onCardTypeChange({ cardType: 'mastercard' });

        component.update();

        const { setFieldValue } = paymentForm;

        expect(setFieldValue).toHaveBeenCalledWith('hostedForm.cardType', 'mastercard');
    });

    it('highlights hosted field in focus', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onFocus } = await getHostedFormOptions();

        if (!onFocus) throw new Error(`onFocus undefined`);

        act(() => {
            onFocus({ fieldType: 'cardNumber' as HostedFieldType });
        });

        component.update();

        expect(component.find(HostedCreditCardFieldset).prop('focusedFieldType')).toBe(
            'cardNumber',
        );
    });

    it('clears highlight if hosted field in no longer in focus', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onBlur } = await getHostedFormOptions();

        if (!onBlur) throw new Error(`onBlur undefined`);

        onBlur({ fieldType: 'cardNumber' as HostedFieldType });

        component.update();

        expect(component.find(HostedCreditCardFieldset).prop('focusedFieldType')).toBeUndefined();
    });

    it('submits form when enter key is pressed', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onEnter } = await getHostedFormOptions();

        if (!onEnter) throw new Error(`onEnter undefined`);

        onEnter({ fieldType: 'cardNumber' as HostedFieldType });

        component.update();

        const { setSubmitted } = paymentForm;

        expect(setSubmitted).toHaveBeenCalled();
    });

    it('submits form when enter key is pressed and CardCode is required', async () => {
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                ...getCart().lineItems,
            },
        });

        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);
        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');
        const instrument = getCardInstrument();

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { onEnter } = await getHostedFormOptions(instrument);

        if (!onEnter) throw new Error(`onEnter undefined`);

        onEnter({ fieldType: 'cardNumber' as HostedFieldType });

        component.update();

        const { setSubmitted } = paymentForm;

        expect(setSubmitted).toHaveBeenCalled();
    });

    it('loads CreditCardCustomerCodeField when customer code is required', () => {
        const { language } = createLocaleContext(getStoreConfig());
        const config = { ...getPaymentMethod().config, requireCustomerCode: true };

        defaultProps = {
            method: { ...getPaymentMethod(), config },
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        expect(
            component.find(CreditCardPaymentMethodComponent).find(CreditCardCustomerCodeField),
        ).toHaveLength(1);
    });

    it('does not pass card code field option when card code is not required', async () => {
        const { language } = createLocaleContext(getStoreConfig());
        const config = { ...getPaymentMethod().config, cardCode: false };

        defaultProps = {
            method: { ...getPaymentMethod(), config },
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(initializePayment).toHaveBeenCalledWith({
            creditCard: {
                form: {
                    fields: {
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
                },
            },
            gatewayId: undefined,
            methodId: 'authorizenet',
        });
    });

    it('does not pass card holder name field option when card name is not required', async () => {
        const { language } = createLocaleContext(getStoreConfig());
        const config = { ...getPaymentMethod().config, showCardHolderName: false };

        defaultProps = {
            method: { ...getPaymentMethod(), config },
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(initializePayment).toHaveBeenCalledWith({
            creditCard: {
                form: {
                    fields: {
                        cardCode: {
                            accessibilityLabel: 'CVV',
                            containerId: 'authorizenet-ccCvv',
                        },
                        cardExpiry: {
                            accessibilityLabel: 'Expiration',
                            containerId: 'authorizenet-ccExpiry',
                            placeholder: 'MM / YY',
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
                },
            },
            gatewayId: undefined,
            methodId: 'authorizenet',
        });
    });

    it('does not have styleContainerId when instrument is selected', async () => {
        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');
        const instrument = getCardInstrument();

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { styles, fields } = await getHostedFormOptions(instrument);

        expect(styles).toEqual({});
        expect(fields).toEqual({
            cardCodeVerification: undefined,
            cardNumberVerification: undefined,
        });
    });

    it('requires card code and number verification when shipping address is not trusted', async () => {
        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue({
            ...getCart(),
            lineItems: {
                ...getCart().lineItems,
            },
        });

        const component = mount(<HostedCreditCardPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const getHostedFormOptions = component
            .find(CreditCardPaymentMethodComponent)
            .prop('getHostedFormOptions');
        const instrument = {
            ...getCardInstrument(),
            trustedShippingAddress: false,
        };

        if (!getHostedFormOptions) throw new Error('getHostedFormOptions undefined');

        const { fields } = await getHostedFormOptions(instrument);

        expect(fields).toEqual({
            cardCodeVerification: {
                accessibilityLabel: 'CVV',
                containerId: 'authorizenet-ccCvv',
                instrumentId: '123',
            },
            cardNumberVerification: {
                accessibilityLabel: 'Credit Card Number',
                containerId: 'authorizenet-ccNumber',
                instrumentId: '123',
            },
        });
    });
});
