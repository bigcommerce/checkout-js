import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik, FormikValues } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';
import HostedWidgetPaymentMethod, {
    HostedWidgetPaymentMethodProps,
} from './HostedWidgetPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';

describe('BoltEmbeddedPaymentMethod', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let onPaymentSelect: (hasBoltAccount: boolean) => void;
    let formikCopy: Formik<FormikValues>;

    const initWithFormikComponent = async () => {
        const initializePaymentMock = jest.fn().mockImplementation((options) => {
            onPaymentSelect = options.bolt.onPaymentSelect;

            return checkoutState;
        });

        const component = await mount(
            <Formik
                initialValues={ {} }
                onSubmit={ noop }
                render={ formik => {
                    formikCopy = formik;

                    return (
                        <BoltEmbeddedPaymentMethod
                            deinitializePayment={ async () => checkoutState }
                            initializePayment={ initializePaymentMock }
                            isInitializing={ false }
                            method={ method }
                        />
                    )
                } }
            />
        );

        const hostedWidgetComponent: ReactWrapper<HostedWidgetPaymentMethodProps> = component.find(HostedWidgetPaymentMethod);

        hostedWidgetComponent.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });
    };

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            onUnhandledError: jest.fn(),
        };

        method = {
            ...getPaymentMethod(),
            id: 'bolt',
            method: 'bolt',
            initializationData: {
                embeddedOneClickEnabled: true,
            },
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

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
                containerId: 'boltEmbeddedOneClick',
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

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: method.id,
                gatewayId: method.gateway,
                bolt: {
                    containerId: 'bolt-embedded',
                    useBigCommerceCheckout: true,
                    onPaymentSelect: expect.any(Function),
                },
            }),
        );
    });

    it('updates shouldCreateAccount value on onPaymentSelect callback call', async () => {
        await initWithFormikComponent();

        expect(formikCopy.values.shouldCreateAccount).toBeUndefined();

        await act(async () => {
            await onPaymentSelect(true);
        });

        expect(formikCopy.values.shouldCreateAccount).toBe(false);
    });

    it('should not update shouldCreateAccount value on onPaymentSelect callback call', async () => {
        await initWithFormikComponent();

        expect(formikCopy.values.shouldCreateAccount).toBeUndefined();

        await act(async () => {
            await onPaymentSelect(false);
        });

        expect(formikCopy.values.shouldCreateAccount).toBeUndefined();
    });
});
