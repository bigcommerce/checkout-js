import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';
import { AccountInstrumentFieldset } from '../storedInstrument';
import { getInstruments } from '../storedInstrument/instruments.mock';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

describe('HostedPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: HostedPaymentMethodProps;
    let HostedPaymentMethodTest: FunctionComponent<HostedPaymentMethodProps>;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let storeConfig: StoreConfig;

    beforeEach(() => {
        defaultProps = {
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        storeConfig = getStoreConfig();

        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(storeConfig);
        checkoutState = checkoutService.getState();

        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(storeConfig);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        HostedPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <HostedPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('calls onUnhandledError if initialize was failed', () => {
        defaultProps.initializePayment = jest.fn(() => { throw new Error(); });

        mount(<HostedPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls onUnhandledError if deinitialize was failed', async () => {
        defaultProps.deinitializePayment = jest.fn(() => {
            throw new Error();
        });

        mount(<HostedPaymentMethodTest { ...defaultProps } />).unmount();

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('renders loading overlay while waiting for method to initialize if description is provided', () => {
        let component: ReactWrapper;

        component = mount(
            <HostedPaymentMethodTest {...defaultProps} description="Hello world" isInitializing />,
        );

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        component = mount(<HostedPaymentMethodTest {...defaultProps} description="Hello world" />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('does not render loading overlay if there is no description', () => {
        const component = mount(<HostedPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay)).toHaveLength(0);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            defaultProps.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            mount(<HostedPaymentMethodTest {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
        });

        it('shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(component.find(AccountInstrumentFieldset)).toHaveLength(1);
        });

        it('shows the instrument fieldset when there are instruments, but no trusted stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(
                getInstruments().map((instrument) => ({
                    ...instrument,
                    trustedShippingAddress: false,
                })),
            );

            const component = mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(component.find(AccountInstrumentFieldset)).toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const component = mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(component.find(AccountInstrumentFieldset)).toHaveLength(0);
        });

        it('does not show instruments fieldset when starting from the cart', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataSubmitted').mockReturnValue(true);

            const component = mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(component.find(AccountInstrumentFieldset)).toHaveLength(0);
        });

        it('shows save account checkbox when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const container = mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(container.find('input[name="shouldSaveInstrument"]').exists()).toBe(true);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<HostedPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });
    });
});
