import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    LanguageService,
    PaymentInitializeOptions,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import { getSquareV2 } from './mocks/squarev2-method.mock';
import SquareV2PaymentMethod from './SquareV2PaymentMethod';

describe('SquareV2 payment method', () => {
    let checkoutService: CheckoutService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let deinitializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentRequestOptions]
    >;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let props: PaymentMethodProps;
    let SquareV2PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        checkoutState = checkoutService.getState();
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        paymentForm = getPaymentFormServiceMock();
        props = {
            method: getSquareV2(),
            checkoutService,
            checkoutState,
            paymentForm,
            language: jest.fn() as unknown as LanguageService,
            onUnhandledError: jest.fn(),
        };
        SquareV2PaymentMethodTest = () => (
            <PaymentFormContext.Provider value={{ paymentForm }}>
                <SquareV2PaymentMethod {...props} />
            </PaymentFormContext.Provider>
        );

        const placeholderElement = document.createElement('div');

        placeholderElement.style.backgroundColor = 'rgb(1, 1, 1)';
        placeholderElement.style.borderColor = 'rgb(2, 2, 2)';
        placeholderElement.style.borderRadius = '3px';
        placeholderElement.style.borderWidth = '4px';
        placeholderElement.style.color = 'rgb(5, 5, 5)';
        placeholderElement.style.fontSize = '6px';
        placeholderElement.style.fontWeight = 'normal';

        jest.spyOn(document, 'querySelector').mockReturnValue(placeholderElement);
    });

    it('should render a loading overlay', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingInstruments').mockReturnValue(true);

        const { container } = render(<SquareV2PaymentMethodTest />);

        expect(container.getElementsByClassName('loadingOverlay')).toHaveLength(1);
    });

    it('should render placeholder form fields', () => {
        const placeholderForm = render(<SquareV2PaymentMethodTest />).getByTestId(
            'squarev2_placeholder_form',
        );

        expect(placeholderForm).toMatchSnapshot();
    });

    it('should be initialized with the required config', () => {
        render(<SquareV2PaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
                squarev2: {
                    containerId: 'squarev2_payment_element_container',
                    style: {
                        input: {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal',
                        },
                        'input.is-focus': {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal',
                        },
                        'input.is-error': { color: 'rgb(5, 5, 5)' },
                        '.input-container': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderRadius: '3px',
                            borderWidth: '4px',
                        },
                        '.input-container.is-focus': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderWidth: '4px',
                        },
                        '.input-container.is-error': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderWidth: '4px',
                        },
                        '.message-text': { color: 'rgb(5, 5, 5)' },
                        '.message-icon': { color: 'rgb(5, 5, 5)' },
                        '.message-text.is-error': { color: 'rgb(5, 5, 5)' },
                        '.message-icon.is-error': { color: 'rgb(5, 5, 5)' },
                    },
                },
            }),
        );
    });

    it('should be initialized without style', () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);

        render(<SquareV2PaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
                squarev2: {
                    containerId: 'squarev2_payment_element_container',
                    style: undefined,
                },
            }),
        );
    });

    it('should be deinitialized with the required config', () => {
        render(<SquareV2PaymentMethodTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
            }),
        );
    });

    it('should not render store instrument fieldset when storing cards is disabled', () => {
        const { container } = render(<SquareV2PaymentMethodTest />);

        expect(container.getElementsByClassName('form-field--saveInstrument')).toHaveLength(0);
    });

    describe('when storing credit cards is enabled', () => {
        let localeContext: LocaleContextType;

        beforeEach(() => {
            localeContext = createLocaleContext(getStoreConfig());
            props = {
                ...props,
                method: {
                    ...getSquareV2(),
                    config: { ...getSquareV2().config, isVaultingEnabled: true },
                },
            };

            SquareV2PaymentMethodTest = () => (
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <CheckoutProvider checkoutService={checkoutService}>
                        <LocaleContext.Provider value={localeContext}>
                            <Formik initialValues={{}} onSubmit={noop}>
                                <SquareV2PaymentMethod {...props} />
                            </Formik>
                        </LocaleContext.Provider>
                    </CheckoutProvider>
                </PaymentFormContext.Provider>
            );

            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        });

        it('should render store instrument fieldset', () => {
            const { container } = render(<SquareV2PaymentMethodTest />);

            expect(container.getElementsByClassName('form-field--saveInstrument')).toHaveLength(1);
        });

        it('should not show instruments fieldset when there are no stored cards', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const { container } = render(<SquareV2PaymentMethodTest />);

            expect(container.getElementsByClassName('instrumentFieldset')).toHaveLength(0);
        });

        it('should show instruments fieldset when there is at least one stored card', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            const { container } = render(<SquareV2PaymentMethodTest />);

            expect(container.getElementsByClassName('instrumentFieldset')).toHaveLength(1);
        });
    });
});
