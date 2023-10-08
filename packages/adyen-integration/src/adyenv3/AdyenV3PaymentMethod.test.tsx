import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { act, fireEvent, render, screen } from '@testing-library/react';
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
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';

import AdyenV3PaymentMethod from './AdyenV3PaymentMethod';

describe('when using AdyenV3 payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv3', method: 'scheme' };
        paymentForm = getPaymentFormServiceMock();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        defaultProps = {
            method: { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv3', method: 'scheme' },
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <AdyenV3PaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('matches snapshot', () => {
        render(<PaymentMethodTest {...defaultProps} method={method} />);
        expect(render(<PaymentMethodTest {...defaultProps} method={method} />)).toMatchSnapshot();
    });

    it('initializes method with required config', () => {
        const defaultAdyenProps: PaymentMethodProps = {
            method: { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv3', method: 'scheme' },
            onUnhandledError: jest.fn(),
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
        };

        render(<PaymentMethodTest {...defaultAdyenProps} method={method} />);

        expect(initializePayment).toHaveBeenCalled();

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                adyenv3: {
                    cardVerificationContainerId: undefined,
                    containerId: 'adyen-scheme-component-field',
                    hasVaultedInstruments: false,
                    options: {
                        hasHolderName: true,
                        holderNameRequired: true,
                    },
                    additionalActionOptions: {
                        containerId: 'adyen-scheme-additional-action-component-field',
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        onBeforeLoad: expect.any(Function),
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        onComplete: expect.any(Function),
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        onLoad: expect.any(Function),
                        widgetSize: '05',
                    },
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    validateCardFields: expect.any(Function),
                },
                gatewayId: method.gateway,
                methodId: method.id,
            }),
        );
    });

    describe('#During payment', () => {
        it('renders 3DS modal if required by selected method', async () => {
            const defaultAdyenProps = {
                method: getPaymentMethod(),
                onUnhandledError: jest.fn(),
                paymentForm,
                checkoutService,
                checkoutState,
                language: createLanguageService(),
            };

            const { container } = render(
                <PaymentMethodTest {...defaultAdyenProps} method={method} />,
            );

            const initializeOptions = initializePayment.mock.calls[0][0];

            initializeOptions.adyenv3.additionalActionOptions.onBeforeLoad(true);

            await new Promise((resolve) => process.nextTick(resolve));

            render(<PaymentMethodTest {...defaultAdyenProps} />, { container });

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('Do not render 3DS modal if required by selected method', async () => {
            const defaultAdyenProps: PaymentMethodProps = {
                method: {
                    ...getPaymentMethod(),
                    id: 'scheme',
                    gateway: 'adyenv3',
                    method: 'scheme',
                },
                onUnhandledError: jest.fn(),
                checkoutService,
                checkoutState,
                paymentForm,
                language: createLanguageService(),
            };

            render(<PaymentMethodTest {...defaultAdyenProps} method={method} />);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions
            const initializeOptions: PaymentInitializeOptions = (initializePayment as jest.Mock)
                .mock.calls[0][0];

            initializeOptions.adyenv3.additionalActionOptions.onBeforeLoad(false);

            await new Promise((resolve) => process.nextTick(resolve));

            render(<PaymentMethodTest {...defaultAdyenProps} />);
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('cancels 3DS modal flow if user chooses to close modal', async () => {
            const cancelAdditionalActionModalFlow = jest.fn();

            const defaultAdyenProps = {
                method: getPaymentMethod(),
                onUnhandledError: jest.fn(),
                paymentForm,
                checkoutService,
                checkoutState,
                language: createLanguageService(),
                cancelAdditionalActionModalFlow: jest.fn(),
            };

            render(<PaymentMethodTest {...defaultAdyenProps} method={method} />);

            const initializeOptions = initializePayment.mock.calls[0][0];

            act(() => {
                initializeOptions.adyenv3.additionalActionOptions.onBeforeLoad(true);
            });

            await new Promise((resolve) => process.nextTick(resolve));

            initializeOptions.adyenv3.additionalActionOptions.onLoad(
                cancelAdditionalActionModalFlow,
            );

            fireEvent.click(
                screen.getByText(defaultAdyenProps.language.translate('common.close_action')),
                'onRequestClose',
            );

            expect(cancelAdditionalActionModalFlow).toHaveBeenCalledTimes(1);
        });
    });
});
