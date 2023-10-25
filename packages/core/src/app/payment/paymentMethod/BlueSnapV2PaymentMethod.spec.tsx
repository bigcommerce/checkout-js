import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../../cart/carts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { Modal, ModalProps } from '../../ui/modal';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import BlueSnapV2PaymentMethod, { BlueSnapV2PaymentMethodProps } from './BlueSnapV2PaymentMethod';
import HostedPaymentMethod from './HostedPaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using BlueSnapV2 payment', () => {
    let defaultProps: BlueSnapV2PaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let BlueSnapV2PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        defaultProps = {
            initializePayment: jest.fn(),
            deinitializePayment: jest.fn(),
            method: {
                ...getPaymentMethod(),
                id: 'mastercard',
                gateway: PaymentMethodId.BlueSnapV2,
            },
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        BlueSnapV2PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BlueSnapV2PaymentMethod {...defaultProps} {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('renders as hosted payment method', () => {
        const container = mount(<BlueSnapV2PaymentMethodTest />);

        expect(container.find(HostedPaymentMethod)).toHaveLength(1);
    });

    it('initializes method with required config', () => {
        mount(<BlueSnapV2PaymentMethodTest />);

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
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
        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2.onLoad(document.createElement('iframe'), jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        act(() => {
            component.update();
        });

        expect(component.find(Modal).prop('isOpen')).toBe(true);
    });

    it('renders modal and appends bluesnap payment page', async () => {
        const component = mount(<BlueSnapV2PaymentMethodTest />);
        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];
        const iframe = document.createElement('iframe');

        act(() => initializeOptions.bluesnapv2.onLoad(iframe, jest.fn()));

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
        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2.onLoad(undefined, jest.fn());
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
        const initializeOptions = (defaultProps.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bluesnapv2.onLoad(
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            modal.prop('onRequestClose')!(new MouseEvent('click') as any);
        });

        expect(cancelBlueSnapV2Payment).toHaveBeenCalledTimes(1);
    });
});
