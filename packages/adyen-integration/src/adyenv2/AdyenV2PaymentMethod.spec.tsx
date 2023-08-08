import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { HostedWidgetPaymentComponent } from '@bigcommerce/checkout/hosted-widget-integration';
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
} from '@bigcommerce/checkout/test-utils';
import { Modal } from '@bigcommerce/checkout/ui';

import AdyenV2PaymentMethod from './AdyenV2PaymentMethod';

describe('when using Adyen V2 payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv2', method: 'scheme' };
        paymentForm = getPaymentFormServiceMock();

        defaultProps = {
            method: { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv2', method: 'scheme' },
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <AdyenV2PaymentMethod {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(HostedWidgetPaymentComponent);

        expect(component.props()).toEqual(
            expect.objectContaining({
                containerId: 'adyen-scheme-component-field',
                deinitializePayment: expect.any(Function),
                initializePayment: expect.any(Function),
                method,
            }),
        );
    });

    it('initializes method with required config', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component = container.find(HostedWidgetPaymentComponent);

        component.prop('initializePayment')({
            methodId: 'scheme',
            gatewayId: 'adyenv2',
        });

        const defaultAdyenProps: PaymentMethodProps = {
            method: { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv2', method: 'scheme' },
            onUnhandledError: jest.fn(),
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
        };

        render(<PaymentMethodTest {...defaultAdyenProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalled();

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                adyenv2: {
                    additionalActionOptions: {
                        containerId: 'adyen-scheme-additional-action-component-field',
                        onBeforeLoad: expect.any(Function),
                        onComplete: expect.any(Function),
                        onLoad: expect.any(Function),
                        widgetSize: '05',
                    },
                    cardderificationContainerId: undefined,
                    containerId: 'adyen-scheme-component-field',
                    hasVaultedInstruments: false,
                    options: {
                        hasHolderName: true,
                        holderNameRequired: true,
                    },
                    shouldShowNumberField: undefined,
                    threeDS2ContainerId: 'adyen-scheme-additional-action-component-field',
                    validateCardFields: expect.any(Function),
                },
                gatewayId: 'adyenv2',
                methodId: 'scheme',
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
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} method={method} />);
            const component = container.find(HostedWidgetPaymentComponent);

            render(<PaymentMethodTest {...defaultAdyenProps} />);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock
                .calls[0][0];

            act(() => {
                initializeOptions.adyenv2.additionalActionOptions.onBeforeLoad(true);
            });

            await new Promise((resolve) => process.nextTick(resolve));

            act(() => {
                container.update();
            });

            expect(container.find(Modal).prop('isOpen')).toBe(true);

            expect(container.find('#adyen-scheme-additional-action-component-field')).toHaveLength(
                1,
            );
        });

        it('Do not render 3DS modal if required by selected method', async () => {
            const defaultAdyenProps: PaymentMethodProps = {
                method: {
                    ...getPaymentMethod(),
                    id: 'scheme',
                    gateway: 'adyenv2',
                    method: 'scheme',
                },
                onUnhandledError: jest.fn(),
                checkoutService,
                checkoutState,
                paymentForm,
                language: createLanguageService(),
            };
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock
                .calls[0][0];

            act(() => {
                initializeOptions.adyenv2.additionalActionOptions.onBeforeLoad(false);
            });

            await new Promise((resolve) => process.nextTick(resolve));

            act(() => {
                container.update();
            });

            expect(container.find(Modal).prop('isOpen')).toBe(false);

            expect(container.find('#adyen-scheme-additional-action-component-field')).toHaveLength(
                1,
            );
        });

        it('cancels 3DS modal flow if user chooses to close modal', async () => {
            const cancelAdditionalActionModalFlow = jest.fn();
            const defaultAdyenProps: PaymentMethodProps = {
                method: {
                    ...getPaymentMethod(),
                    id: 'scheme',
                    gateway: 'adyenv2',
                    method: 'scheme',
                },
                onUnhandledError: jest.fn(),
                checkoutService,
                checkoutState,
                paymentForm,
                language: createLanguageService(),
            };
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} />);
            const component = container.find(HostedWidgetPaymentComponent);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock
                .calls[0][0];

            act(() => {
                initializeOptions.adyenv2.additionalActionOptions.onLoad(
                    cancelAdditionalActionModalFlow,
                    true,
                );
            });

            await new Promise((resolve) => process.nextTick(resolve));

            act(() => {
                container.update();
            });

            const modal = container.find(Modal);

            act(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                modal.prop('onRequestClose')!(new MouseEvent('click') as any);
            });

            expect(cancelAdditionalActionModalFlow).toHaveBeenCalled();
        });
    });
});
