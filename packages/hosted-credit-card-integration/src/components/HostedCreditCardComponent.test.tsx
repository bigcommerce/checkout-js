import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithoutWrapper } from '@bigcommerce/checkout/test-utils';

import HostedCreditCardComponent from './HostedCreditCardComponent';

jest.mock('@bigcommerce/checkout/credit-card-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreditCardPaymentMethodComponent: jest.fn(({ cardFieldset, initializePayment }) => (
        <div data-test="cc-payment-method">
            {cardFieldset}
            <button
                data-test="init-btn"
                onClick={
                    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
                    () => initializePayment({}, undefined)
                }
            >
                Initialize
            </button>
        </div>
    )),
}));

jest.mock('./HostedCreditCardFieldset', () => ({
    HostedCreditCardFieldset: ({
        cardCodeId,
        cardExpiryId,
        cardNameId,
        cardNumberId,
        focusedFieldType,
        additionalFields,
    }) => (
        <div data-test="fieldset">
            {cardCodeId && <div data-test="cc-cvv">{cardCodeId}</div>}
            {cardExpiryId && <div data-test="cc-expiry">{cardExpiryId}</div>}
            {cardNameId && <div data-test="cc-name">{cardNameId}</div>}
            {cardNumberId && <div data-test="cc-number">{cardNumberId}</div>}
            {focusedFieldType && <div data-test="focused">{focusedFieldType}</div>}
            {additionalFields}
        </div>
    ),
}));

jest.mock('./HostedCreditCardValidation', () => ({
    HostedCreditCardValidation: ({ cardCodeId, cardNumberId, focusedFieldType }) => (
        <div data-test="validation">
            {cardCodeId && <div data-test="val-cc-cvv">{cardCodeId}</div>}
            {cardNumberId && <div data-test="val-cc-number">{cardNumberId}</div>}
            {focusedFieldType && <div data-test="val-focused">{focusedFieldType}</div>}
        </div>
    ),
}));

jest.mock(
    '@bigcommerce/checkout/instrument-utils',
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    () => ({
        ...jest.requireActual('@bigcommerce/checkout/instrument-utils'),
        getCreditCardInputStyles: jest.fn().mockResolvedValue({}),
        isInstrumentCardCodeRequiredSelector: () => () => true,
        isInstrumentCardNumberRequiredSelector: () => () => true,
        CreditCardCustomerCodeField: () => <div data-test="customer-code-field" />,
    }),
);

jest.mock('./getHostedCreditCardValidationSchema', () => ({
    getHostedCreditCardValidationSchema: jest.fn(() => ({})),
}));
jest.mock('./getHostedInstrumentValidationSchema', () => ({
    getHostedInstrumentValidationSchema: jest.fn(() => ({})),
}));

const getDefaultProps = (overrides = {}) => ({
    method: {
        id: 'credit_card',
        gateway: 'bluesnapdirect',
        config: {
            cardCode: true,
            showCardHolderName: true,
            requireCustomerCode: false,
        },
    },
    checkoutService: {
        initializePayment: jest.fn().mockResolvedValue(undefined),
        deinitializePayment: jest.fn(),
    },
    checkoutState: {},
    paymentForm: {
        setFieldTouched: jest.fn(),
        setFieldValue: jest.fn(),
        setSubmitted: jest.fn(),
        submitForm: jest.fn(),
    },
    language: {
        translate: (key: string) => key,
    },
    onUnhandledError: jest.fn(),
    ...overrides,
});

describe('HostedCreditCardComponent', () => {
    it('renders HostedCreditCardFieldset with correct ids', () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        expect(screen.getByTestId('fieldset')).toBeInTheDocument();
        expect(screen.getByTestId('cc-cvv')).toHaveTextContent('bluesnapdirect-credit_card-ccCvv');
        expect(screen.getByTestId('cc-expiry')).toHaveTextContent(
            'bluesnapdirect-credit_card-ccExpiry',
        );
        expect(screen.getByTestId('cc-name')).toHaveTextContent(
            'bluesnapdirect-credit_card-ccName',
        );
        expect(screen.getByTestId('cc-number')).toHaveTextContent(
            'bluesnapdirect-credit_card-ccNumber',
        );
    });

    it('renders customer code field if requireCustomerCode is true', () => {
        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    method: {
                        id: 'credit_card',
                        gateway: 'bluesnapdirect',
                        config: {
                            cardCode: true,
                            showCardHolderName: true,
                            requireCustomerCode: true,
                        },
                    },
                })}
            />,
        );

        expect(screen.getByTestId('customer-code-field')).toBeInTheDocument();
    });

    it('calls initializePayment with correct options', async () => {
        const initializePayment = jest.fn().mockResolvedValue(undefined);

        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    checkoutService: { initializePayment, deinitializePayment: jest.fn() },
                })}
            />,
        );

        fireEvent.click(screen.getByTestId('init-btn'));

        await waitFor(() => expect(initializePayment).toHaveBeenCalled());

        expect(initializePayment.mock.calls[0][0]).toHaveProperty('creditCard');
    });

    it('passes correct validation schemas to CreditCardPaymentMethodComponent', () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        expect(screen.getByTestId('cc-payment-method')).toBeInTheDocument();
    });

    it('renders HostedCreditCardFieldset with correct fields when cardCode/showCardHolderName are false', () => {
        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    method: {
                        id: 'credit_card',
                        gateway: 'bluesnapdirect',
                        config: {
                            cardCode: false,
                            showCardHolderName: false,
                            requireCustomerCode: false,
                        },
                    },
                })}
            />,
        );

        expect(screen.queryByTestId('cc-cvv')).not.toBeInTheDocument();
        expect(screen.queryByTestId('cc-name')).not.toBeInTheDocument();
        expect(screen.getByTestId('cc-expiry')).toBeInTheDocument();
        expect(screen.getByTestId('cc-number')).toBeInTheDocument();
    });

    it('handles onCardTypeChange by calling setFieldValue', async () => {
        const setFieldValue = jest.fn();

        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    paymentForm: { ...getDefaultProps().paymentForm, setFieldValue },
                })}
            />,
        );

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls.slice(-1)[0][0].getHostedFormOptions;
        const options = await getHostedFormOptions();

        await waitFor(() => {
            options.onCardTypeChange({ cardType: 'visa' });
            expect(setFieldValue).toHaveBeenCalledWith('hostedForm.cardType', 'visa');
        });
    });

    it('handles onEnter by calling setSubmitted and submitForm', async () => {
        const setSubmitted = jest.fn();
        const submitForm = jest.fn();

        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    paymentForm: { ...getDefaultProps().paymentForm, setSubmitted, submitForm },
                })}
            />,
        );

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls.slice(-1)[0][0].getHostedFormOptions;
        const options = await getHostedFormOptions();

        await waitFor(() => {
            options.onEnter();
            expect(setSubmitted).toHaveBeenCalledWith(true);
        });

        expect(submitForm).toHaveBeenCalled();
    });

    it('handles onFocus by setting focusedFieldType', async () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls[0][0].getHostedFormOptions;
        const options = await getHostedFormOptions();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        expect(() => options.onFocus({ fieldType: 'ccNumber' })).not.toThrow();
    });

    it('handles onValidate by calling setFieldValue and setFieldTouched for errors', async () => {
        const setFieldValue = jest.fn();
        const setFieldTouched = jest.fn();

        renderWithoutWrapper(
            <HostedCreditCardComponent
                {...getDefaultProps({
                    paymentForm: {
                        ...getDefaultProps().paymentForm,
                        setFieldValue,
                        setFieldTouched,
                    },
                })}
            />,
        );

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls.slice(-1)[0][0].getHostedFormOptions;
        const options = await getHostedFormOptions();

        await waitFor(() => {
            options.onValidate({
                errors: {
                    ccNumber: [{ type: 'required' }],
                    ccCvv: [{ type: 'invalid' }],
                },
            });

            expect(setFieldValue).toHaveBeenCalledWith('hostedForm.errors.ccNumber', 'required');
        });

        expect(setFieldValue).toHaveBeenCalledWith('hostedForm.errors.ccCvv', 'invalid');
        expect(setFieldTouched).toHaveBeenCalledWith('hostedForm.errors.ccNumber');
        expect(setFieldTouched).toHaveBeenCalledWith('hostedForm.errors.ccCvv');
    });

    it('renders HostedCreditCardValidation with cardCodeId when isInstrumentCardCodeRequired is true', () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        const getStoredCardValidationFieldset = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls[0][0].getStoredCardValidationFieldset;

        const instrument = { bigpayToken: 'token123' };
        const validationFieldset = getStoredCardValidationFieldset(instrument);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        renderWithoutWrapper(validationFieldset);

        expect(screen.getByTestId('val-cc-cvv')).toHaveTextContent(
            'bluesnapdirect-credit_card-ccCvv',
        );
    });

    it('renders HostedCreditCardValidation with cardNumberId when isInstrumentCardNumberRequired is true', () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        const getStoredCardValidationFieldset = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls[0][0].getStoredCardValidationFieldset;

        const instrument = { bigpayToken: 'token123' };
        const validationFieldset = getStoredCardValidationFieldset(instrument);

        // eslint-disable-next-line  @typescript-eslint/no-unsafe-argument
        renderWithoutWrapper(validationFieldset);

        expect(screen.getByTestId('val-cc-number')).toHaveTextContent(
            'bluesnapdirect-credit_card-ccNumber',
        );
    });

    it('returns correct fields when selectedInstrument is provided to getHostedFormOptions', async () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls[0][0].getHostedFormOptions;

        const selectedInstrument = { bigpayToken: 'token123' };
        const options = await getHostedFormOptions(selectedInstrument);

        expect(options.fields.cardCodeVerification).toEqual({
            accessibilityLabel: 'payment.credit_card_cvv_label',
            containerId: 'bluesnapdirect-credit_card-ccCvv',
            instrumentId: 'token123',
        });
        expect(options.fields.cardNumberVerification).toEqual({
            accessibilityLabel: 'payment.credit_card_number_label',
            containerId: 'bluesnapdirect-credit_card-ccNumber',
            instrumentId: 'token123',
        });
    });

    it('returns cardNumberVerification field when selectedInstrument is present and isInstrumentCardNumberRequired is true', async () => {
        renderWithoutWrapper(<HostedCreditCardComponent {...getDefaultProps()} />);

        const getHostedFormOptions = (
            jest.requireMock('@bigcommerce/checkout/credit-card-integration')
                .CreditCardPaymentMethodComponent as jest.Mock
        ).mock.calls[0][0].getHostedFormOptions;

        const selectedInstrument = { bigpayToken: 'token456' };
        const options = await getHostedFormOptions(selectedInstrument);

        expect(options.fields.cardNumberVerification).toEqual({
            accessibilityLabel: 'payment.credit_card_number_label',
            containerId: 'bluesnapdirect-credit_card-ccNumber',
            instrumentId: 'token456',
        });
    });
});
