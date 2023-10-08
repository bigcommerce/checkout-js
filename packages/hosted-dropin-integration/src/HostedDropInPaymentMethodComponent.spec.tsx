import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { EventEmitter } from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CardInstrumentFieldset } from '@bigcommerce/checkout/instrument-utils';
import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { CheckoutContext, PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConsignment,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { HostedDropInPaymentMethodComponent, HostedDropInPaymentMethodProps } from '.'

describe('HostedDropInPaymentMethodComponent', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: HostedDropInPaymentMethodProps;
    let HostedDropInPaymentMethodTest: FunctionComponent<HostedDropInPaymentMethodProps>;
    let localeContext: LocaleContextType;
    let paymentForm: PaymentFormService;
    let subscribeEventEmitter: EventEmitter;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        subscribeEventEmitter = new EventEmitter();
        paymentForm = getPaymentFormServiceMock();

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

        defaultProps = {
            containerId: 'widget-container',
            initializePayment: jest.fn(),
            deinitializePayment: jest.fn(),
            initializeCustomer: jest.fn(),
            method: getPaymentMethod(),
            checkoutService,
            checkoutState,
            language: localeContext.language,
            onUnhandledError: jest.fn(),
            paymentForm,
        };

        defaultProps.method.id = 'digitalriver';

        HostedDropInPaymentMethodTest = (props) => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <LocaleContext.Provider value={localeContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <HostedDropInPaymentMethodComponent {...props} />
                    </Formik>
                </LocaleContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
        expect(paymentForm.setSubmit).toHaveBeenCalled();
    });

    it('initializes payment method without optional props when component mounts', () => {
        delete defaultProps.onUnhandledError;
        delete defaultProps.initializeCustomer;

        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalled();
        expect(paymentForm.setSubmit).toHaveBeenCalled();
    });

    it('initializes customer when component mounts and sign-in is required', () => {
        defaultProps.isSignInRequired = true;

        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializeCustomer).toHaveBeenCalled();
    });

    it('handles error when component mounts', async () => {
        jest.spyOn(defaultProps, 'initializePayment').mockRejectedValue(new Error('test error'));
        mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
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
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} isInitializing />);

        expect(component.find(LoadingOverlay).prop('isLoading')).toBe(true);

        const component2 = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component2.find(LoadingOverlay).prop('isLoading')).toBe(false);
    });

    it('hides content while loading', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading')).toBe(true);
    });

    it('renders placeholder container with provided ID', () => {
        const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

        expect(component.exists(`#${defaultProps.containerId}`)).toBe(true);
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

            const { hidePaymentSubmitButton } = paymentForm;

            expect(hidePaymentSubmitButton).toHaveBeenCalledWith(defaultProps.method, false);
        });

        it('shows the payment submit button when payment data is not required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            const { hidePaymentSubmitButton } = paymentForm;

            expect(hidePaymentSubmitButton).toHaveBeenCalledWith(defaultProps.method, false);
        });

        it('shows the payment submit button when payment data is required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            const { hidePaymentSubmitButton } = paymentForm;

            expect(hidePaymentSubmitButton).toHaveBeenCalledWith(defaultProps.method, true);
        });

        it('hides the payment submit button when a vaulted instrument is not selected', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            const { hidePaymentSubmitButton } = paymentForm;

            expect(hidePaymentSubmitButton).toHaveBeenCalledWith(defaultProps.method, true);
        });

        it('shows fields on the Widget when you click Use another payment form on the vaulted instruments dropdown', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            component.find(CardInstrumentFieldset).prop('onSelectInstrument')(
                getInstruments()[0].bigpayToken,
            );
            component.update();
            component.find(CardInstrumentFieldset).prop('onUseNewInstrument')();
            component.update();

            expect(
                component.find(CardInstrumentFieldset).prop('selectedInstrumentId'),
            ).toBeUndefined();
        });

        it('switches to "use new card" view if all instruments are deleted', () => {
            const component = mount(<HostedDropInPaymentMethodTest {...defaultProps} />);

            expect(component.find(CardInstrumentFieldset)).toHaveLength(1);

            // Update state
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

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
