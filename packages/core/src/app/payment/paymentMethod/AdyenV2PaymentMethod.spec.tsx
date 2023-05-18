import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { Modal, ModalProps } from '../../ui/modal';
import { getPaymentMethod } from '../payment-methods.mock';

import { AdyenPaymentMethodProps } from './AdyenV2PaymentMethod';
import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

describe('when using Adyen V2 payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'scheme', gateway: 'adyenv2', method: 'scheme' };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PaymentMethodComponent {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted widget method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} method={method} />);
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

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
        const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
            container.find(HostedWidgetPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(checkoutService.initializePayment).toHaveBeenCalled();

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                adyenv2: {
                    cardVerificationContainerId: undefined,
                    containerId: 'adyen-scheme-component-field',
                    hasVaultedInstruments: false,
                    options: {
                        hasHolderName: true,
                        holderNameRequired: true,
                    },
                    additionalActionOptions: {
                        containerId: 'adyen-scheme-additional-action-component-field',
                        widgetSize: '05',
                        onBeforeLoad: expect.any(Function),
                        onComplete: expect.any(Function),
                        onLoad: expect.any(Function),
                    },
                    threeDS2ContainerId: 'adyen-scheme-additional-action-component-field',
                    validateCardFields: expect.any(Function),
                },
                gatewayId: method.gateway,
                methodId: method.id,
            }),
        );
    });

    describe('#During payment', () => {
        it('renders 3DS modal if required by selected method', async () => {
            const defaultAdyenProps: AdyenPaymentMethodProps = {
                deinitializePayment: jest.fn(),
                initializePayment: jest.fn(),
                isInitializing: false,
                method: getPaymentMethod(),
                onUnhandledError: jest.fn(),
            };
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (defaultAdyenProps.initializePayment as jest.Mock).mock
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
            const defaultAdyenProps: AdyenPaymentMethodProps = {
                deinitializePayment: jest.fn(),
                initializePayment: jest.fn(),
                isInitializing: false,
                method: getPaymentMethod(),
                onUnhandledError: jest.fn(),
            };
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (defaultAdyenProps.initializePayment as jest.Mock).mock
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
            const defaultAdyenProps: AdyenPaymentMethodProps = {
                deinitializePayment: jest.fn(),
                initializePayment: jest.fn(),
                isInitializing: false,
                method: getPaymentMethod(),
                onUnhandledError: jest.fn(),
            };
            const container = mount(<PaymentMethodTest {...defaultAdyenProps} method={method} />);
            const component: ReactWrapper<HostedWidgetPaymentMethodProps> =
                container.find(HostedWidgetPaymentMethod);

            component.prop('initializePayment')({
                methodId: method.id,
                gatewayId: method.gateway,
            });

            const initializeOptions = (defaultAdyenProps.initializePayment as jest.Mock).mock
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

            const modal: ReactWrapper<ModalProps> = container.find(Modal);

            act(() => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                modal.prop('onRequestClose')!(new MouseEvent('click') as any);
            });

            expect(cancelAdditionalActionModalFlow).toHaveBeenCalled();
        });
    });
});
