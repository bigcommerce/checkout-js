import {
    BankInstrument,
    CardInstrument,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent, ReactElement } from 'react';
import { Schema } from 'yup';

import {
    AccountInstrumentFieldset,
    CardInstrumentFieldset,
    getCreditCardValidationSchema,
    SignOutLink,
} from '@bigcommerce/checkout/instrument-utils';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
    TranslatedString,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getCheckoutPayment,
    getConsignment,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import HostedWidgetPaymentComponent, {
    HostedWidgetComponentProps,
    PaymentContextProps,
    WithCheckoutHostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentComponent';

describe('HostedWidgetPaymentMethod', () => {
    let HostedWidgetPaymentMethodTest: FunctionComponent<HostedWidgetComponentProps>;
    let defaultProps: HostedWidgetComponentProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentContext: PaymentContextProps;
    let paymentForm: PaymentFormService;
    let checkoutHostedWidgetPaymentProps: WithCheckoutHostedWidgetPaymentMethodProps;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        checkoutHostedWidgetPaymentProps = {
            instruments: [],
            isInstrumentFeatureAvailable: false,
            isLoadingInstruments: false,
            isPaymentDataRequired: true,
            isSignedIn: false,
            isInstrumentCardCodeRequired: jest.fn(),
            isInstrumentCardNumberRequired: jest.fn(),
            loadInstruments: jest.fn(),
            signOut: jest.fn(),
        };

        defaultProps = {
            containerId: 'widget-container',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
            ...checkoutHostedWidgetPaymentProps,
        };

        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        paymentContext = {
            disableSubmit: paymentForm.disableSubmit,
            setSubmit: paymentForm.setSubmit,
            setFieldValue: paymentForm.setFieldValue,
            setValidationSchema: paymentForm.setValidationSchema,
            hidePaymentSubmitButton: paymentForm.hidePaymentSubmitButton,
        };

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        HostedWidgetPaymentMethodTest = (props) => {
            const mergedProps = {
                ...props,
                ...paymentContext,
            };

            return (
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <Formik initialValues={{}} onSubmit={noop}>
                                <HostedWidgetPaymentComponent {...mergedProps} />
                            </Formik>
                        </PaymentFormContext.Provider>
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            );
        };
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
        expect(paymentContext.setSubmit).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('does not initialize payment method if payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        mount(<HostedWidgetPaymentMethodTest {...defaultProps} isPaymentDataRequired={false} />);

        expect(defaultProps.initializePayment).not.toHaveBeenCalled();
    });

    it('reinitialize payment method after requiring payment data is changing', async () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        const container = mount(
            <HostedWidgetPaymentMethodTest {...defaultProps} isPaymentDataRequired={false} />,
        );

        expect(defaultProps.initializePayment).not.toHaveBeenCalled();

        container.setProps({ isPaymentDataRequired: true });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('hides content while loading', () => {
        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading')).toBe(true);
    });

    it('renders placeholder container with provided ID', () => {
        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.exists(`#${defaultProps.containerId}`)).toBe(true);
    });

    it('does not render sign out link', () => {
        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find(SignOutLink)).toHaveLength(0);
    });

    it('shows the payment descriptor', () => {
        const propsDescriptor = {
            ...defaultProps,
            shouldShowDescriptor: true,
            paymentDescriptor: 'meow',
        };

        const component = mount(<HostedWidgetPaymentMethodTest {...propsDescriptor} />);

        expect(component.find('.payment-descriptor')).toHaveLength(1);
    });

    it('does not show the payment descriptor', () => {
        const propsDescriptor = {
            ...defaultProps,
            shouldShowDescriptor: false,
            paymentDescriptor: 'meow',
        };

        const component = mount(<HostedWidgetPaymentMethodTest {...propsDescriptor} />);

        expect(component.find('.payment-descriptor')).toHaveLength(0);
    });

    it('does not render the component', () => {
        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find(HostedWidgetPaymentMethodTest)).toHaveLength(1);

        component.setProps({ shouldShow: false });

        expect(component.isEmptyRender()).toBe(true);
    });

    it('renders custom payment method component', () => {
        const MockComponent = (): ReactElement => {
            return <div id="custom-form-id" />;
        };

        defaultProps = {
            ...defaultProps,
            method: {
                ...getPaymentMethod(),
                id: 'card',
            },
            renderCustomPaymentForm: () => <MockComponent />,
            shouldRenderCustomInstrument: true,
        };

        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find('[id="custom-form-id"]')).toHaveLength(1);
    });

    it('does execute validateCustomRender', () => {
        defaultProps = {
            ...defaultProps,
            method: {
                ...getPaymentMethod(),
                id: 'card',
            },
            renderCustomPaymentForm: jest.fn(),
            shouldRenderCustomInstrument: true,
        };

        mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.renderCustomPaymentForm).toHaveBeenCalled();
    });

    it('does not render custom payment method component', () => {
        const MockComponent = (): ReactElement => {
            return <div id="custom-form-id" />;
        };

        defaultProps = {
            ...defaultProps,
            method: {
                ...getPaymentMethod(),
                id: 'card',
            },

            renderCustomPaymentForm: () => <MockComponent />,
            shouldRenderCustomInstrument: false,
        };

        const component = mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

        expect(component.find('[id="custom-form-id"]')).toHaveLength(0);
    });

    describe('when user is signed into their payment method account', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ ...getCheckoutPayment(), providerId: defaultProps.method.id }],
            });
        });

        it('renders link for user to edit their selected credit card', () => {
            const payMethodId = 'walletButton';
            const component = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    buttonId={payMethodId}
                    isSignedIn={true}
                    shouldShowEditButton
                />,
            );

            expect(component.find(`#${payMethodId}`).find(TranslatedString).prop('id')).toBe(
                'remote.select_different_card_action',
            );
        });
    });

    describe('when user is not signed into their payment method account and is required to', () => {
        beforeEach(() => {
            defaultProps = {
                ...defaultProps,
                deinitializeCustomer: jest.fn(),
                initializeCustomer: jest.fn(),
                isSignInRequired: true,
                signInCustomer: jest.fn(),
            };
        });

        it('asks user to sign in when payment form is submitted', () => {
            mount(<HostedWidgetPaymentMethodTest {...defaultProps} />);

            expect(defaultProps.initializeCustomer).toHaveBeenCalled();

            expect(paymentContext.setSubmit).toHaveBeenCalledWith(
                defaultProps.method,
                defaultProps.signInCustomer,
            );
        });

        it('does not ask user to sign in if payment data is not required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

            mount(
                <HostedWidgetPaymentMethodTest {...defaultProps} isPaymentDataRequired={false} />,
            );

            expect(defaultProps.initializeCustomer).not.toHaveBeenCalled();

            expect(paymentContext.setSubmit).not.toHaveBeenCalledWith(
                defaultProps.method,
                defaultProps.signInCustomer,
            );
        });
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            defaultProps.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', () => {
            const loadInstruments = jest.fn();

            mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={getInstruments()}
                    isInstrumentFeatureAvailable={true}
                    loadInstruments={loadInstruments}
                />,
            );

            expect(loadInstruments).toHaveBeenCalled();
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={getInstruments()}
                    isInstrumentFeatureAvailable={true}
                />,
            );

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);
        });

        it('shows fields on the Widget when you click Use another payment form on the vaulted card instruments dropdown', () => {
            const mockCardInstrument: CardInstrument[] = [
                {
                    bigpayToken: '123',
                    provider: 'braintree',
                    iin: '11111111',
                    last4: '4321',
                    expiryMonth: '02',
                    expiryYear: '2025',
                    brand: 'visa',
                    trustedShippingAddress: true,
                    defaultInstrument: true,
                    method: 'card',
                    type: 'card',
                },
            ];

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(mockCardInstrument);

            const component = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={mockCardInstrument}
                    isInstrumentFeatureAvailable={true}
                />,
            );

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            const hostedWidgetComponent = component.find('#widget-container');

            expect(hostedWidgetComponent).toHaveLength(1);

            expect(component.text()).toMatch(/save/i);
            expect(component.text()).not.toMatch(/account/i);
            expect(component.text()).toMatch(/card/i);

            expect(component.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('shows hosted widget and save credit card form when there are no stored instruments', () => {
            const container = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={[]}
                    isInstrumentFeatureAvailable={true}
                />,
            );
            const hostedWidgetComponent = container.find('#widget-container');

            expect(hostedWidgetComponent).toHaveLength(1);

            expect(container.text()).toMatch(/save/i);
            expect(container.text()).toMatch(/card/i);
            expect(container.text()).not.toMatch(/account/i);

            expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('shows save account checkbox when has isAccountInstrument prop', () => {
            defaultProps.isAccountInstrument = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const container = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={[]}
                    isInstrumentFeatureAvailable={true}
                />,
            );
            const hostedWidgetComponent = container.find('#widget-container');

            expect(hostedWidgetComponent).toHaveLength(1);

            expect(container.text()).toMatch(/save/i);
            expect(container.text()).toMatch(/account/i);
            expect(container.text()).not.toMatch(/card/i);

            expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('shows fields on the Widget when you click Use another payment form on the vaulted bank account instruments dropdown', () => {
            defaultProps.isAccountInstrument = true;

            const mockBankInstrument: BankInstrument[] = [
                {
                    bigpayToken: '45454545',
                    provider: 'adyen',
                    accountNumber: 'GHI',
                    issuer: 'JKL',
                    externalId: 'test@external-id-4.com',
                    trustedShippingAddress: false,
                    defaultInstrument: false,
                    method: 'ideal',
                    type: 'bank',
                    iban: '12345',
                },
            ];

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(mockBankInstrument);

            const container = mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={mockBankInstrument}
                    isInstrumentFeatureAvailable={true}
                />,
            );

            container.find(AccountInstrumentFieldset).prop('onUseNewInstrument')();
            container.update();

            expect(container.find('.form-field--saveInstrument')).toHaveLength(1);

            expect(container.find('.form-field--saveInstrument')).toHaveLength(1);
        });

        it('sets validation schema when component mounts', () => {
            const expectedSchema = getCreditCardValidationSchema({
                isCardCodeRequired: true,
                language: localeContext.language,
            });

            mount(
                <HostedWidgetPaymentMethodTest
                    {...defaultProps}
                    instruments={getInstruments()}
                    isInstrumentFeatureAvailable={true}
                    storedCardValidationSchema={expectedSchema}
                />,
            );

            expect(paymentContext.setValidationSchema).toHaveBeenCalled();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions
            const schema: Schema<any> = (paymentContext.setValidationSchema as jest.Mock).mock
                .calls[0][1];

            expect(Object.keys(schema.describe().fields)).toEqual(
                Object.keys(expectedSchema.describe().fields),
            );
        });
    });
});
