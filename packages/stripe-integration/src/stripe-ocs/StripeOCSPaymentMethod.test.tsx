import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentMethod,
    type WithStripeOCSPaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { createStripeOCSPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { screen } from '@bigcommerce/checkout/test-utils';
import { AccordionContext, type AccordionContextProps } from '@bigcommerce/checkout/ui';

import StripeOCSPaymentMethod from './StripeOCSPaymentMethod';

jest.mock('./getStripeOCSStyles', () => ({
    getAppearanceForOCSElement: () => {
        return {
            variables: {
                color: '#cccccc',
            },
        };
    },
    getFonts: () => [{ cssSrc: 'fontSrc' }],
}));

describe('when using Stripe OCS payment', () => {
    const methodId = 'optimized_checkout';
    const gatewayId = 'stripeocs';
    const methodSelectorPrefix = `${gatewayId}-${methodId}`;
    const expectedContainerId = `${methodSelectorPrefix}-component-field`;
    const defaultAccordionLayout = {
        defaultCollapsed: false,
        radios: true,
        spacedAccordionItems: false,
        type: 'accordion',
        visibleAccordionItemsCount: 0,
        linkInAccordion: true,
    };
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let collapseElementMock: jest.Mock;

    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let onToggleMock: jest.Mock;
    let accordionContextValues: AccordionContextProps;

    beforeEach(() => {
        collapseElementMock = jest.fn();
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = {
            ...getPaymentMethod(),
            id: methodId,
            gateway: gatewayId,
            initializationData: {
                isCustomChecklistItem: true,
            },
        };
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        onToggleMock = jest.fn();
        accordionContextValues = {
            onToggle: onToggleMock,
            selectedItemId: methodSelectorPrefix,
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AccordionContext.Provider value={accordionContextValues}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <StripeOCSPaymentMethod {...props} />
                        </Formik>
                    </AccordionContext.Provider>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('initializes method with required config when no instruments', () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(undefined);

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId,
            methodId,
            integrations: [createStripeOCSPaymentStrategy],
            [gatewayId]: {
                containerId: expectedContainerId,
                layout: defaultAccordionLayout,
                appearance: {
                    variables: { color: '#cccccc' },
                },
                fonts: [{ cssSrc: 'fontSrc' }],
                onError: expect.any(Function),
                render: expect.any(Function),
                paymentMethodSelect: expect.any(Function),
                handleClosePaymentMethod: expect.any(Function),
                togglePreloader: expect.any(Function),
            },
        });
    });

    it('initializes method with required config when customer is defined', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue({
            ...getCustomer(),
            isGuest: false,
        });
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            stripeLinkAuthenticationState: true,
        });

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId,
            methodId,
            integrations: [createStripeOCSPaymentStrategy],
            [gatewayId]: {
                containerId: expectedContainerId,
                layout: defaultAccordionLayout,
                appearance: {
                    variables: { color: '#cccccc' },
                },
                fonts: [{ cssSrc: 'fontSrc' }],
                onError: expect.any(Function),
                render: expect.any(Function),
                paymentMethodSelect: expect.any(Function),
                handleClosePaymentMethod: expect.any(Function),
                togglePreloader: expect.any(Function),
            },
        });
    });

    it('initializes method with required config', () => {
        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [gatewayId]: {
                    containerId: expectedContainerId,
                    layout: defaultAccordionLayout,
                    appearance: {
                        variables: { color: '#cccccc' },
                    },
                    fonts: [{ cssSrc: 'fontSrc' }],
                    onError: expect.any(Function),
                    render: expect.any(Function),
                    paymentMethodSelect: expect.any(Function),
                    handleClosePaymentMethod: expect.any(Function),
                    togglePreloader: expect.any(Function),
                },
            }),
        );
    });

    it('initialize without error handler', () => {
        const props = {
            ...defaultProps,
            onUnhandledError: undefined,
        } as unknown as PaymentMethodProps;

        render(<PaymentMethodTest {...props} method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                [gatewayId]: {
                    containerId: expectedContainerId,
                    layout: defaultAccordionLayout,
                    appearance: {
                        variables: { color: '#cccccc' },
                    },
                    fonts: [{ cssSrc: 'fontSrc' }],
                    onError: expect.any(Function),
                    render: expect.any(Function),
                    paymentMethodSelect: expect.any(Function),
                    handleClosePaymentMethod: expect.any(Function),
                    togglePreloader: expect.any(Function),
                },
            }),
        );
    });

    it('should show submit button', () => {
        const hidePaymentSubmitButtonMock = jest.fn();
        const props = {
            ...defaultProps,
            paymentForm: {
                ...defaultProps.paymentForm,
                hidePaymentSubmitButton: hidePaymentSubmitButtonMock,
            },
        };

        jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
            (options: WithStripeOCSPaymentInitializeOptions) => {
                options.stripeocs?.render();

                return Promise.resolve(checkoutState);
            },
        );
        render(<PaymentMethodTest {...props} method={method} />);

        expect(hidePaymentSubmitButtonMock).toHaveBeenCalledWith(method, false);
    });

    it('should not initialize method if payment not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        render(<PaymentMethodTest {...defaultProps} method={method} />);

        expect(screen.queryByTestId('stripe-accordion-skeleton')).not.toBeInTheDocument();
        expect(checkoutService.initializePayment).not.toHaveBeenCalled();
    });

    describe('# Stripe OCS accordion layout', () => {
        it('should initialize with auto layout when isCustomChecklistItem is false', () => {
            method = {
                ...method,
                initializationData: {
                    isCustomChecklistItem: false,
                },
            };

            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                    [gatewayId]: {
                        containerId: expectedContainerId,
                        layout: {
                            ...defaultAccordionLayout,
                            type: 'auto',
                        },
                        appearance: {
                            variables: { color: '#cccccc' },
                        },
                        fonts: [{ cssSrc: 'fontSrc' }],
                        onError: expect.any(Function),
                        render: expect.any(Function),
                        paymentMethodSelect: expect.any(Function),
                        handleClosePaymentMethod: expect.any(Function),
                        togglePreloader: expect.any(Function),
                    },
                }),
            );
        });

        it('should initialize with accordion layout when isCustomChecklistItem is true', () => {
            method = {
                ...method,
                initializationData: {
                    isCustomChecklistItem: true,
                },
            };

            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                    [gatewayId]: {
                        containerId: expectedContainerId,
                        layout: {
                            ...defaultAccordionLayout,
                            type: 'accordion',
                        },
                        appearance: {
                            variables: { color: '#cccccc' },
                        },
                        fonts: [{ cssSrc: 'fontSrc' }],
                        onError: expect.any(Function),
                        render: expect.any(Function),
                        paymentMethodSelect: expect.any(Function),
                        handleClosePaymentMethod: expect.any(Function),
                        togglePreloader: expect.any(Function),
                    },
                }),
            );
        });

        it('accordion collapsed when selected different payment method', () => {
            accordionContextValues.selectedItemId = 'nonStripeItem';

            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                    [gatewayId]: {
                        containerId: expectedContainerId,
                        layout: {
                            ...defaultAccordionLayout,
                            defaultCollapsed: true,
                        },
                        appearance: {
                            variables: { color: '#cccccc' },
                        },
                        fonts: [{ cssSrc: 'fontSrc' }],
                        onError: expect.any(Function),
                        render: expect.any(Function),
                        paymentMethodSelect: expect.any(Function),
                        handleClosePaymentMethod: expect.any(Function),
                        togglePreloader: expect.any(Function),
                    },
                }),
            );
        });

        it('accordion open when selected OCS payment method', () => {
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,
                    gatewayId: method.gateway,
                    [gatewayId]: {
                        containerId: expectedContainerId,
                        layout: defaultAccordionLayout,
                        appearance: {
                            variables: { color: '#cccccc' },
                        },
                        fonts: [{ cssSrc: 'fontSrc' }],
                        onError: expect.any(Function),
                        render: expect.any(Function),
                        paymentMethodSelect: expect.any(Function),
                        handleClosePaymentMethod: expect.any(Function),
                        togglePreloader: expect.any(Function),
                    },
                }),
            );
        });
    });

    describe('# Stripe OCS accordion actions', () => {
        it('toggle accordion preloader', () => {
            let toggleAction: ((show: boolean) => void) | undefined;

            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeOCSPaymentInitializeOptions) => {
                    toggleAction = options.stripeocs?.togglePreloader;

                    return Promise.resolve(checkoutState);
                },
            );

            const { rerender } = render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(screen.getByTestId('stripe-accordion-skeleton')).toBeInTheDocument();

            if (typeof toggleAction === 'function') {
                toggleAction(false);
            }

            rerender(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(screen.queryByTestId('stripe-accordion-skeleton')).not.toBeInTheDocument();
        });

        it('should call collapse BC accordion when stripe accordion item is selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeOCSPaymentInitializeOptions) => {
                    options.stripeocs?.paymentMethodSelect?.('methodId');

                    return Promise.resolve(checkoutState);
                },
            );
            render(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(onToggleMock).toHaveBeenCalled();
        });

        it('should collapse stripe accordion when BC accordion item selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeOCSPaymentInitializeOptions) => {
                    options.stripeocs?.handleClosePaymentMethod?.(collapseElementMock);

                    return Promise.resolve(checkoutState);
                },
            );

            const { rerender } = render(<PaymentMethodTest {...defaultProps} method={method} />);

            accordionContextValues.selectedItemId = 'nonStripeItem';

            rerender(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(collapseElementMock).toHaveBeenCalled();
        });

        it('should not collapse stripe accordion when Stripe accordion item selected', () => {
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(
                (options: WithStripeOCSPaymentInitializeOptions) => {
                    options.stripeocs?.handleClosePaymentMethod?.(collapseElementMock);

                    return Promise.resolve(checkoutState);
                },
            );

            const { rerender } = render(<PaymentMethodTest {...defaultProps} method={method} />);

            accordionContextValues.selectedItemId = 'stripeocs-optimized_checkout';

            rerender(<PaymentMethodTest {...defaultProps} method={method} />);

            expect(collapseElementMock).not.toHaveBeenCalled();
        });
    });
});
