import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../cart/carts.mock';
import { getStoreConfig } from '../config/config.mock';
import { getCustomer } from '../customer/customers.mock';
import {
    TermsConditionsField,
    TermsConditionsFieldProps,
    TermsConditionsType,
} from '../termsConditions';

import { getCreditCardValidationSchema } from './creditCard';
import { getPaymentMethod } from './payment-methods.mock';
import PaymentContext, { PaymentContextProps } from './PaymentContext';
import PaymentForm, { PaymentFormProps } from './PaymentForm';
import { PaymentMethodList, PaymentMethodListProps } from './paymentMethod';
import PaymentSubmitButton from './PaymentSubmitButton';
import SpamProtectionField, { SpamProtectionProps } from './SpamProtectionField';
import { StoreCreditField, StoreCreditFieldProps, StoreCreditOverlay } from './storeCredit';

jest.useFakeTimers();

describe('PaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentFormProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let PaymentFormTest: FunctionComponent<PaymentFormProps>;

    beforeEach(() => {
        defaultProps = {
            isStoreCreditApplied: true,
            defaultMethodId: getPaymentMethod().id,
            isPaymentDataRequired: jest.fn(() => true),
            methods: [getPaymentMethod(), { ...getPaymentMethod(), id: 'cybersource' }],
            onSubmit: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        PaymentFormTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <PaymentForm {...props} />
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders list of payment methods', () => {
        const container = mount(<PaymentFormTest {...defaultProps} />);
        const methodList: ReactWrapper<PaymentMethodListProps> = container.find(PaymentMethodList);

        expect(methodList).toHaveLength(1);

        expect(methodList.prop('methods')).toEqual(defaultProps.methods);
    });

    it('renders terms and conditions field if copy is provided', () => {
        const container = mount(
            <PaymentFormTest
                {...defaultProps}
                isTermsConditionsRequired={true}
                termsConditionsText="Accept terms"
            />,
        );
        const termsField: ReactWrapper<TermsConditionsFieldProps> =
            container.find(TermsConditionsField);

        expect(termsField).toHaveLength(1);

        expect(termsField.props()).toEqual(
            expect.objectContaining({
                terms: 'Accept terms',
                type: TermsConditionsType.TextArea,
            }),
        );
    });

    it('renders terms and conditions field if terms URL is provided', () => {
        const container = mount(
            <PaymentFormTest
                {...defaultProps}
                isTermsConditionsRequired={true}
                termsConditionsUrl="https://foobar.com/terms"
            />,
        );
        const termsField: ReactWrapper<TermsConditionsFieldProps> =
            container.find(TermsConditionsField);

        expect(termsField).toHaveLength(1);

        expect(termsField.props()).toEqual(
            expect.objectContaining({
                url: 'https://foobar.com/terms',
                type: TermsConditionsType.Link,
            }),
        );
    });

    it('does not render terms and conditions field if it is not required', () => {
        const container = mount(<PaymentFormTest {...defaultProps} />);

        expect(container.find(TermsConditionsField)).toHaveLength(0);
    });

    it('renders spam protection field if spam check should be executed', () => {
        const container = mount(
            <PaymentFormTest {...defaultProps} shouldExecuteSpamCheck={true} />,
        );
        const spamProtectionField: ReactWrapper<SpamProtectionProps> =
            container.find(SpamProtectionField);

        expect(spamProtectionField).toHaveLength(1);
    });

    it('renders store credit field if store credit can be applied', () => {
        const container = mount(<PaymentFormTest {...defaultProps} usableStoreCredit={100} />);
        const storeCreditField: ReactWrapper<StoreCreditFieldProps> =
            container.find(StoreCreditField);

        expect(storeCreditField).toHaveLength(1);

        expect(storeCreditField.props()).toEqual(
            expect.objectContaining({
                name: 'useStoreCredit',
                usableStoreCredit: 100,
            }),
        );
    });

    it('does not render store credit field if store credit cannot be applied', () => {
        const container = mount(<PaymentFormTest {...defaultProps} />);

        expect(container.find(StoreCreditField).exists()).toBe(false);
    });

    it('does not render store credit field if store credit cannot be applied', () => {
        const container = mount(<PaymentFormTest usableStoreCredit={10} {...defaultProps} />);

        expect(container.find(StoreCreditField).prop('usableStoreCredit')).toBe(10);
    });

    it('shows overlay if store credit can cover total cost of order', () => {
        jest.spyOn(defaultProps, 'isPaymentDataRequired').mockReturnValue(false);

        const container = mount(<PaymentFormTest {...defaultProps} usableStoreCredit={1000000} />);

        expect(container.find(StoreCreditOverlay)).toHaveLength(1);
    });

    it('does not show overlay if store credit cannot cover total cost of order', () => {
        const container = mount(<PaymentFormTest {...defaultProps} usableStoreCredit={1} />);

        expect(container.find(StoreCreditOverlay)).toHaveLength(0);
    });

    it('notifies parent when user selects new payment method', () => {
        const handleSelect = jest.fn();
        const container = mount(
            <PaymentFormTest {...defaultProps} onMethodSelect={handleSelect} />,
        );
        const methodList: ReactWrapper<PaymentMethodListProps> = container.find(PaymentMethodList);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        methodList.prop('onSelect')!(defaultProps.methods[0]);

        expect(handleSelect).toHaveBeenCalled();
    });

    it('passes form values to parent component', async () => {
        const handleSubmit = jest.fn();
        const container = mount(<PaymentFormTest {...defaultProps} onSubmit={handleSubmit} />);

        container
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '4111 1111 1111 1111', name: 'ccNumber' } });
        container
            .find('input[name="ccCvv"]')
            .simulate('change', { target: { value: '123', name: 'ccCvv' } });
        container
            .find('input[name="ccName"]')
            .simulate('change', { target: { value: 'Foo Bar', name: 'ccName' } });
        container
            .find('input[name="ccExpiry"]')
            .simulate('change', { target: { value: '10 / 22', name: 'ccExpiry' } });
        container.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSubmit).toHaveBeenCalledWith({
            ccNumber: '4111 1111 1111 1111',
            ccCvv: '123',
            ccName: 'Foo Bar',
            ccExpiry: '10 / 22',
            paymentProviderRadio: defaultProps.defaultMethodId,
            shouldCreateAccount: true,
            shouldSaveInstrument: false,
            terms: false,
        });
    });

    it('does not pass form values to parent component if validation fails', async () => {
        const handleSubmit = jest.fn();
        const container = mount(
            <PaymentFormTest
                {...defaultProps}
                onSubmit={handleSubmit}
                validationSchema={getCreditCardValidationSchema({
                    isCardCodeRequired: true,
                    language: localeContext.language,
                })}
            />,
        );

        container
            .find('input[name="ccNumber"]')
            .simulate('change', { target: { value: '4111', name: 'ccNumber' } });
        container
            .find('input[name="ccExpiry"]')
            .simulate('change', { target: { value: '10 / 22', name: 'ccExpiry' } });
        container.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('resets form validation message when switching to new payment method', async () => {
        const container = mount(
            <PaymentFormTest
                {...defaultProps}
                validationSchema={getCreditCardValidationSchema({
                    isCardCodeRequired: true,
                    language: localeContext.language,
                })}
            />,
        );

        // Submitting a blank form should display some error messages based on the provided validation schema
        container.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        container.update();

        expect(container.exists('[data-test="cc-number-field-error-message"]')).toBe(true);

        // Selecting a new payment method should clear the error messages
        act(() => {
            const methodList: ReactWrapper<PaymentMethodListProps> =
                container.find(PaymentMethodList);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            methodList.prop('onSelect')!(defaultProps.methods[1]);
        });

        await new Promise((resolve) => process.nextTick(resolve));

        container.update();

        expect(container.exists('[data-test="cc-number-field-error-message"]')).toBe(false);
    });

    describe('PaymentSubmitButton', () => {
        let selectedMethod: PaymentMethod;

        beforeEach(() => {
            selectedMethod = { ...getPaymentMethod(), id: 'foo', method: 'bar', gateway: 'baz' };
        });

        it('renders with default label', () => {
            defaultProps = { ...defaultProps, selectedMethod };

            const container = mount(<PaymentFormTest {...defaultProps} />);
            const submitButton = container.find(PaymentSubmitButton);

            expect(submitButton).toHaveLength(1);

            expect(submitButton.props()).toEqual(
                expect.objectContaining({
                    methodGateway: 'baz',
                    methodId: 'foo',
                    methodType: 'bar',
                    methodName: 'Authorizenet',
                }),
            );
        });

        it('renders with default label if selected method is amazonpay and there is paymentToken', () => {
            selectedMethod = {
                ...selectedMethod,
                id: 'amazonpay',
                initializationData: { paymentToken: 'foo' },
            };
            defaultProps = { ...defaultProps, selectedMethod };

            const container = mount(<PaymentFormTest {...defaultProps} />);
            const submitButton = container.find(PaymentSubmitButton);

            expect(submitButton).toHaveLength(1);

            expect(submitButton.props()).toEqual(
                expect.objectContaining({
                    methodGateway: 'baz',
                    methodId: undefined,
                    methodType: 'bar',
                    methodName: 'Amazon Pay',
                }),
            );
        });

        it('renders with special label if selected method is amazonpay and there is no paymentToken', () => {
            selectedMethod = {
                ...selectedMethod,
                id: 'amazonpay',
                initializationData: { paymentToken: '' },
            };
            defaultProps = { ...defaultProps, selectedMethod };

            const container = mount(<PaymentFormTest {...defaultProps} />);
            const submitButton = container.find(PaymentSubmitButton);

            expect(submitButton).toHaveLength(1);

            expect(submitButton.props()).toEqual(
                expect.objectContaining({
                    methodGateway: 'baz',
                    methodId: 'amazonpay',
                    methodType: 'bar',
                    methodName: 'Amazon Pay',
                }),
            );
        });
    });
});
