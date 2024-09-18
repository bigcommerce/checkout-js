import {
    CheckoutService,
    CheckoutStoreSelector,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';
import OpyPaymentMethod, { OpyPaymentMethodProps } from './OpyPaymentMethod';

describe('when using Opy payment', () => {
    let checkoutService: CheckoutService;
    let paymentContext: PaymentContextProps;
    let localeContext: LocaleContextType;
    let method: PaymentMethod;
    let defaultProps: OpyPaymentMethodProps;
    let OpyPaymentMethodTest: FunctionComponent;
    let checkoutState: CheckoutStoreSelector;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };
        localeContext = createLocaleContext(getStoreConfig());

        method = {
            ...getPaymentMethod(),
            id: 'opy',
        };
        defaultProps = {
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method,
            onUnhandledError: jest.fn(),
        };

        OpyPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <OpyPaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );

        checkoutState = checkoutService.getState().data;

        jest.spyOn(checkoutState, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState, 'isPaymentDataRequired').mockReturnValue(true);
    });

    it('initializes method with required config', () => {
        mount(<OpyPaymentMethodTest />);

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'opy',
                opy: {
                    containerId: 'learnMoreButton',
                },
            }),
        );
    });

    it('renders as HostedWidgetPaymentMethod', () => {
        const container = mount(<OpyPaymentMethodTest />);

        expect(container.find(HostedWidgetPaymentMethod).props()).toEqual(
            expect.objectContaining({
                containerId: 'learnMoreButton',
                hideWidget: false,
                initializePayment: expect.any(Function),
                method,
                onUnhandledError: expect.any(Function),
            }),
        );
    });

    it("renders loading overlay while it's initializing", () => {
        defaultProps.isInitializing = true;

        const container = mount(<OpyPaymentMethodTest />);
        const overlay = container.find(HostedWidgetPaymentMethod).closest(LoadingOverlay);

        expect(overlay.prop('hideContentWhenLoading')).toBe(true);
        expect(overlay.prop('isLoading')).toBe(true);
    });

    it('renders the expected copy', () => {
        defaultProps.method.config.displayName = 'Foo Payment Method';

        const container = mount(<OpyPaymentMethodTest />);

        const text1 = localeContext.language.translate('payment.opy_widget_slogan');
        const text2 = localeContext.language.translate('payment.opy_widget_info', {
            methodName: 'Foo Payment Method',
        });
        const text3 = localeContext.language.translate('payment.opy_continue_action', {
            methodName: 'Foo Payment Method',
        });

        expect(container.text()).toContain(text1);
        expect(container.text()).toContain(text2);
        expect(container.text()).toContain(text3);
    });

    it('returns correct message when cart is not valid', () => {
        defaultProps.method.config.displayName = 'Foo Payment Method';

        const opyError = Object.create(new Error('Something went wrong.'));

        opyError.name = 'OpyError';
        opyError.type = 'opy_error';
        opyError.subtype = 'invalid_cart';

        mount(<OpyPaymentMethodTest />)
            .find(HostedWidgetPaymentMethod)
            .props()
            .onUnhandledError(opyError);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(
            new Error(
                localeContext.language.translate('payment.opy_invalid_cart_error', {
                    methodName: 'Foo Payment Method',
                }),
            ),
        );
    });

    it('matches snapshot with rendered output', () => {
        defaultProps.method.config.displayName = 'Opy';

        const component = render(<OpyPaymentMethodTest />);

        expect(component).toMatchSnapshot();
    });
});
