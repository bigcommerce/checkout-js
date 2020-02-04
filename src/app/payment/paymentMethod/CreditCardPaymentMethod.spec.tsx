import { createCheckoutService, CheckoutSelectors, CheckoutService, HostedFieldType } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik, FormikProps } from 'formik';
import { last, merge, noop } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';
import { Schema } from 'yup';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getCreditCardInputStyles, getCreditCardValidationSchema, CreditCardFieldset, CreditCardFieldsetProps, CreditCardInputStylesType, HostedCreditCardFieldset, HostedCreditCardFieldsetValues } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import { getInstrumentValidationSchema, isInstrumentFeatureAvailable, CardInstrumentFieldset } from '../storedInstrument';
import { getCardInstrument, getInstruments } from '../storedInstrument/instruments.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps, CreditCardPaymentMethodValues } from './CreditCardPaymentMethod';

jest.mock('../creditCard', () => ({
    ...jest.requireActual('../creditCard'),
    getCreditCardInputStyles: jest.fn<ReturnType<typeof getCreditCardInputStyles>, Parameters<typeof getCreditCardInputStyles>>(
        (_containerId, _fieldType, type) => {
            if (type === CreditCardInputStylesType.Error) {
                return Promise.resolve({ color: 'rgb(255, 0, 0)' });
            }

            if (type === CreditCardInputStylesType.Focus) {
                return Promise.resolve({ color: 'rgb(0, 0, 255)' });
            }

            return Promise.resolve({ color: 'rgb(0, 0, 0)' });
        }
    ),
}));

jest.mock('../storedInstrument', () => ({
    ...jest.requireActual('../storedInstrument'),
    isInstrumentFeatureAvailable: jest.fn<ReturnType<typeof isInstrumentFeatureAvailable>, Parameters<typeof isInstrumentFeatureAvailable>>(
        () => true
    ),
}));

describe('CreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<CreditCardPaymentMethodProps>;
    let formikRender: jest.Mock<ReactNode, [FormikProps<CreditCardPaymentMethodValues>]>;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let CreditCardPaymentMethodTest: FunctionComponent<CreditCardPaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            hostedForm: {},
            instrumentId: '',
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
        };

        jest.spyOn(checkoutService, 'getState')
            .mockReturnValue(checkoutState);

        jest.spyOn(checkoutService, 'subscribe')
            .mockImplementation(subscriber => {
                subscriber(checkoutState);

                return noop;
            });

        jest.spyOn(checkoutService, 'loadInstruments')
            .mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getInstruments')
            .mockReturnValue([]);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        CreditCardPaymentMethodTest = props => {
            formikRender = jest.fn(_ => <CreditCardPaymentMethod { ...props } />);

            return (
                <CheckoutProvider checkoutService={ checkoutService }>
                    <PaymentContext.Provider value={ paymentContext }>
                        <LocaleContext.Provider value={ localeContext }>
                            <Formik
                                initialValues={ initialValues }
                                onSubmit={ noop }
                                render={ formikRender }
                            />
                        </LocaleContext.Provider>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            );
        };
    });

    it('initializes payment method when component mounts', async () => {
        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        await new Promise(resolve => process.nextTick(resolve));

        expect(defaultProps.initializePayment)
            .toHaveBeenCalledWith({
                methodId: defaultProps.method.id,
            });
    });

    it('sets validation schema for credit cards when component mounts', () => {
        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(paymentContext.setValidationSchema)
            .toHaveBeenCalled();

        const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock.calls[0][1];
        const expectedSchema = getCreditCardValidationSchema({
            isCardCodeRequired: true,
            language: localeContext.language,
        });

        expect(Object.keys(schema.describe().fields))
            .toEqual(Object.keys(expectedSchema.describe().fields));
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(false);

        mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(paymentContext.setValidationSchema)
            .toHaveBeenCalledWith(defaultProps.method, null);
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.deinitializePayment)
            .not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment)
            .toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<CreditCardPaymentMethodTest
            { ...defaultProps }
            isInitializing
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(true);

        component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(false);
    });

    it('renders credit card fieldset', () => {
        const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

        expect(component.find(CreditCardFieldset))
            .toHaveLength(1);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment')
                .mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments')
                .mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            expect(checkoutService.loadInstruments)
                .toHaveBeenCalled();
        });

        it('sets validation schema for stored instruments when component mounts', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([{
                    ...getCardInstrument(),
                    trustedShippingAddress: false,
                }]);

            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(paymentContext.setValidationSchema)
                .toHaveBeenCalled();

            const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock.calls[0][1];
            const expectedSchema = getInstrumentValidationSchema({
                instrumentBrand: 'american_express',
                instrumentLast4: '4444',
                isCardCodeRequired: true,
                isCardNumberRequired: true,
                language: localeContext.language,
            });

            expect(Object.keys(schema.describe().fields))
                .toEqual(Object.keys(expectedSchema.describe().fields));
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(CardInstrumentFieldset))
                .toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(CardInstrumentFieldset))
                .toHaveLength(0);
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);
            const component: ReactWrapper<CreditCardFieldsetProps> = container.find(CreditCardFieldset);

            expect(component)
                .toHaveLength(1);

            expect(component.prop('shouldShowSaveCardField'))
                .toEqual(true);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(checkoutState.data.getInstruments)
                .toHaveBeenCalledWith(defaultProps.method);
        });

        it('hides credit card fieldset if user is not adding new card', () => {
            const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(component.find(CreditCardFieldset))
                .toHaveLength(0);

            component.find(CardInstrumentFieldset)
                .prop('onUseNewInstrument')();

            component.update();

            expect(component.find(CardInstrumentFieldset).prop('selectedInstrumentId'))
                .toEqual(undefined);

            expect(component.find(CreditCardFieldset))
                .toHaveLength(1);
        });
    });

    describe('if hosted form feature is enabled', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getConfig')
                .mockReturnValue(merge({}, getStoreConfig(), {
                    checkoutSettings: {
                        isHostedPaymentFormEnabled: true,
                    },
                }));
        });

        it('renders hosted credit card fieldset', () => {
            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            expect(container.find(HostedCreditCardFieldset).length)
                .toEqual(1);
        });

        it('does not render hosted credit card fieldset if there is a manual override', () => {
            const container = mount(
                <CreditCardPaymentMethodTest
                    { ...defaultProps }
                    shouldDisableHostedFieldset
                />
            );

            expect(container.find(HostedCreditCardFieldset).length)
                .toEqual(0);
        });

        it('initializes payment method with hosted form configuration', async () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            expect(defaultProps.initializePayment)
                .toHaveBeenCalledWith({
                    methodId: defaultProps.method.id,
                    creditCard: {
                        form: {
                            fields: {
                                cardCode: { containerId: 'ccCvv' },
                                cardExpiry: { containerId: 'ccExpiry' },
                                cardName: { containerId: 'ccName' },
                                cardNumber: { containerId: 'ccNumber' },
                            },
                            styles: {
                                default: expect.any(Object),
                                error: expect.any(Object),
                                focus: expect.any(Object),
                            },
                            onBlur: expect.any(Function),
                            onCardTypeChange: expect.any(Function),
                            onFocus: expect.any(Function),
                            onValidate: expect.any(Function),
                        },
                    },
                });
        });

        it('passes styling properties to hosted form', async () => {
            mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            expect(getCreditCardInputStyles)
                .toHaveBeenCalledWith('ccNumber', ['color', 'fontFamily', 'fontSize', 'fontWeight']);
            expect(getCreditCardInputStyles)
                .toHaveBeenCalledWith('ccNumber', ['color', 'fontFamily', 'fontSize', 'fontWeight'], CreditCardInputStylesType.Error);
            expect(getCreditCardInputStyles)
                .toHaveBeenCalledWith('ccNumber', ['color', 'fontFamily', 'fontSize', 'fontWeight'], CreditCardInputStylesType.Focus);

            // tslint:disable-next-line:no-non-null-assertion
            expect(defaultProps.initializePayment.mock.calls[0][0].creditCard!.form)
                .toEqual(expect.objectContaining({
                    styles: {
                        default: { color: 'rgb(0, 0, 0)' },
                        error: { color: 'rgb(255, 0, 0)' },
                        focus: { color: 'rgb(0, 0, 255)' },
                    },
                }));
        });

        it('passes error messages from hosted form to Formik form', async () => {
            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            // tslint:disable-next-line:no-non-null-assertion
            const onValidate = defaultProps.initializePayment.mock.calls[0][0].creditCard!.form.onValidate!;

            onValidate({
                isValid: false,
                errors: {
                    cardCode: [],
                    cardExpiry: [],
                    cardName: [],
                    cardNumber: [{ fieldType: 'cardNumber', type: 'required', message: 'Card number is required' }],
                },
            });

            container.update();

            // tslint:disable-next-line:no-non-null-assertion
            expect((last(formikRender.mock.calls)![0].values as HostedCreditCardFieldsetValues).hostedForm.errors)
                .toEqual(expect.objectContaining({
                    cardNumber: 'required',
                }));
        });

        it('passes card type from hosted form to Formik form', async () => {
            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            // tslint:disable-next-line:no-non-null-assertion
            const onCardTypeChange = defaultProps.initializePayment.mock.calls[0][0].creditCard!.form.onCardTypeChange!;

            onCardTypeChange({ cardType: 'mastercard' });

            container.update();

            // tslint:disable-next-line:no-non-null-assertion
            expect((last(formikRender.mock.calls)![0].values as HostedCreditCardFieldsetValues).hostedForm.cardType)
                .toEqual('mastercard');
        });

        it('highlights hosted field in focus', async () => {
            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            // tslint:disable-next-line:no-non-null-assertion
            const onFocus = last(defaultProps.initializePayment.mock.calls)![0].creditCard!.form.onFocus!;

            onFocus({ fieldType: 'cardNumber' as HostedFieldType });

            container.update();

            expect(container.find(HostedCreditCardFieldset).prop('focusedFieldType'))
                .toEqual('cardNumber');
        });

        it('clears highlight if hosted field in no longer in focus', async () => {
            const container = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

            await new Promise(resolve => process.nextTick(resolve));

            // tslint:disable-next-line:no-non-null-assertion
            const onBlur = last(defaultProps.initializePayment.mock.calls)![0].creditCard!.form.onBlur!;

            onBlur({ fieldType: 'cardNumber' as HostedFieldType });

            container.update();

            expect(container.find(HostedCreditCardFieldset).prop('focusedFieldType'))
                .toEqual(undefined);
        });

        describe('if stored instrument is available', () => {
            beforeEach(() => {
                jest.spyOn(checkoutState.data, 'getInstruments')
                    .mockReturnValue([{
                        ...getCardInstrument(),
                        trustedShippingAddress: false,
                    }]);
            });

            it('initializes payment method with hosted verification fields if paying with stored card', async () => {
                mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

                await new Promise(resolve => process.nextTick(resolve));

                expect(defaultProps.initializePayment)
                    .toHaveBeenCalledWith({
                        methodId: defaultProps.method.id,
                        creditCard: {
                            form: {
                                fields: {
                                    cardCodeVerification: {
                                        containerId: 'ccCvv',
                                        instrumentId: getCardInstrument().bigpayToken,
                                    },
                                    cardNumberVerification: {
                                        containerId: 'ccNumber',
                                        instrumentId: getCardInstrument().bigpayToken,
                                    },
                                },
                                styles: {
                                    default: expect.any(Object),
                                    error: expect.any(Object),
                                    focus: expect.any(Object),
                                },
                                onBlur: expect.any(Function),
                                onCardTypeChange: expect.any(Function),
                                onFocus: expect.any(Function),
                                onValidate: expect.any(Function),
                            },
                        },
                    });
            });

            it('re-initializes payment method when using new card', async () => {
                const component = mount(<CreditCardPaymentMethodTest { ...defaultProps } />);

                defaultProps.deinitializePayment.mockReset();
                defaultProps.initializePayment.mockReset();

                component.find(CardInstrumentFieldset)
                    .prop('onUseNewInstrument')();

                component.update();

                expect(defaultProps.deinitializePayment)
                    .toHaveBeenCalled();

                await new Promise(resolve => process.nextTick(resolve));

                expect(defaultProps.initializePayment)
                    .toHaveBeenCalled();
            });
        });
    });
});
