import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { merge, noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';
import { CardInstrumentFieldset } from '../storedInstrument';
import { getInstruments } from '../storedInstrument/instruments.mock';

import HostedDropInPaymentMethod, {
    HostedDropInPaymentMethodProps,
} from './HostedDropInPaymentMethod';

describe('HostedDropInPaymentMethod', () => {
    let HostedDropInPaymentMethodTest: FunctionComponent<HostedDropInPaymentMethodProps>;
    let defaultProps: HostedDropInPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentContext: PaymentContextProps;
    let subscribeEventEmitter: EventEmitter;

    beforeEach(() => {
        defaultProps = {
            containerId: 'widget-container',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
        };

        defaultProps.method.id = 'digitalriver';

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };
        subscribeEventEmitter = new EventEmitter();

        jest.spyOn(checkoutService, 'subscribe').mockImplementation((subscriber) => {
            subscribeEventEmitter.on('change', () => subscriber(checkoutState));
            subscribeEventEmitter.emit('change');

            return noop;
        });

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        HostedDropInPaymentMethodTest = (props) => (
            <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentContext.Provider value={paymentContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <HostedDropInPaymentMethod {...props} />
                        </Formik>
                    </PaymentContext.Provider>
                </CheckoutProvider>
            </LocaleContext.Provider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
        expect(paymentContext.setSubmit).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('does not initialize payment method if payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).not.toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<HostedDropInPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('hides content while loading', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading')).toBe(true);
    });

    it('renders placeholder container with provided ID', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component.exists(`#${defaultProps.containerId}`)).toBe(true);
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            defaultProps.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', () => {
            mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });

        it('shows the payment submit button when a vaulted instrument is selected', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onSelectInstrument')(
                getInstruments()[0].bigpayToken,
            );
            component.update();

            expect(paymentContext.hidePaymentSubmitButton).toHaveBeenCalledWith(
                defaultProps.method,
                false,
            );
        });

        it('shows the payment submit button when payment data is not required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            expect(paymentContext.hidePaymentSubmitButton).toHaveBeenCalledWith(
                defaultProps.method,
                false,
            );
        });

        it('shows the payment submit button when payment data is required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            expect(paymentContext.hidePaymentSubmitButton).toHaveBeenCalledWith(
                defaultProps.method,
                true,
            );
        });

        it('hides the payment submit button when a vaulted instrument is not selected', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            expect(paymentContext.hidePaymentSubmitButton).toHaveBeenCalledWith(
                defaultProps.method,
                true,
            );
        });

        it('shows fields on the Widget when you click Use another payment form on the vaulted instruments dropdown', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onSelectInstrument')(
                getInstruments()[0].bigpayToken,
            );
            component.update();
            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            expect(component.find(CardInstrumentFieldset).prop('selectedInstrumentId')).toBeUndefined();
        });

        it('switches to "use new card" view if all instruments are deleted', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);

            // Update state
            checkoutState = merge({}, checkoutState, {
                data: {
                    getInstruments: jest.fn(() => []),
                },
            });

            subscribeEventEmitter.emit('change');

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(CardInstrumentFieldset).prop('onDeleteInstrument')!(
                getInstruments()[0].bigpayToken,
            );

            component.update();

            expect(component.find('.paymentMethod--hosted')).toHaveLength(1);
        });
    });
});
