import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { act } from '@testing-library/react';
import { mount, ReactWrapper } from 'enzyme';
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
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodId,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { Modal } from '@bigcommerce/checkout/ui';
import HostedPaymentMethodComponent from 'packages/hosted-payment-integration/src/HostedPaymentComponent';
import { ModalProps } from 'packages/ui/src/modal';

import BlueSnapV2PaymentMethod from './BlueSnapV2PaymentMethod';

describe('when using BlueSnapV2 payment', () => {
    let defaultProps: PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let BlueSnapV2PaymentMethodTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        defaultProps = {
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
            method: {
                ...getPaymentMethod(),
                id: 'mastercard',
                gateway: PaymentMethodId.BlueSnapV2,
            },
        };
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        BlueSnapV2PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BlueSnapV2PaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted payment method', () => {
        const container = mount(<BlueSnapV2PaymentMethodTest />);

        expect(container.find(HostedPaymentMethodComponent)).toHaveLength(1);
    });

    it('initializes method with required config', () => {
        mount(<BlueSnapV2PaymentMethodTest />);

        expect(defaultProps.checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'mastercard',
                gatewayId: 'bluesnapv2',
                bluesnapv2: {
                    onLoad: expect.any(Function),
                    style: {
                        border: expect.any(String),
                        height: expect.any(String),
                        width: expect.any(String),
                    },
                },
            }),
        );
    });

    it('renders modal that hosts bluesnap payment page', async () => {
        const component = mount(<BlueSnapV2PaymentMethodTest />);
        const initializeOptions = initializePayment.mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2?.onLoad(document.createElement('iframe'), jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);
    });

    it('renders modal and appends bluesnap payment page', async () => {
        const component = mount(<BlueSnapV2PaymentMethodTest />);
        const initializeOptions = initializePayment.mock.calls[0][0];
        const iframe = document.createElement('iframe');

        act(() => initializeOptions.bluesnapv2?.onLoad(iframe, jest.fn()));

        await new Promise((resolve) => process.nextTick(resolve));

        await act(async () => {
            component.update();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(Modal).prop('onAfterOpen')!();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);

        expect(component.find(Modal).render().find('iframe')).toHaveLength(1);
    });

    it('renders modal but does not append bluesnap payment page because is empty', async () => {
        const component = mount(<BlueSnapV2PaymentMethodTest />);
        const initializeOptions = initializePayment.mock.calls[0][0];
        
        act(() => {
            initializeOptions.bluesnapv2?.onLoad(undefined, jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            component.find(Modal).prop('onAfterOpen')!();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(false);

        expect(component.find(Modal).render().find('iframe')).toHaveLength(0);
    });

    it('cancels payment flow if user chooses to close modal', async () => {
        const cancelBlueSnapV2Payment = jest.fn();
        const component = mount(<BlueSnapV2PaymentMethodTest />);
        const initializeOptions = initializePayment.mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2?.onLoad(
                document.createElement('iframe'),
                cancelBlueSnapV2Payment,
            );
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        const modal: ReactWrapper<ModalProps> = component.find(Modal);

        act(() => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/consistent-type-assertions
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-argument, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
        });

        expect(cancelBlueSnapV2Payment).toHaveBeenCalledTimes(1);
    });
});
