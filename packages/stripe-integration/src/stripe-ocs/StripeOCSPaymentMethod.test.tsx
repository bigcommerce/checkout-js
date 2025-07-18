import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentMethod,
    WithStripeOCSPaymentInitializeOptions,
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
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCheckout,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { AccordionContext, AccordionContextProps } from '@bigcommerce/checkout/ui';

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
        method = { ...getPaymentMethod(), id: methodId, gateway: gatewayId };
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
                },
            }),
        );
    });

    // TODO: remove after fix issue with module on BE side
    it('initializes method without gateway id', () => {
        const methodWithoutGatewayId = {
            ...method,
            gateway: undefined,
        };

        render(<PaymentMethodTest {...defaultProps} method={methodWithoutGatewayId} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: undefined,
                [methodId]: {
                    containerId: `undefined-${methodId}-component-field`,
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
                },
            }),
        );
    });

    describe('# Stripe OCS accordion layout', () => {
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
                    },
                }),
            );
        });
    });

    describe('# Stripe OCS accordion actions', () => {
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
