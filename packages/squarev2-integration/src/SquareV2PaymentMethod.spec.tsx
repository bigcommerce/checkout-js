import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    LanguageService,
    PaymentInitializeOptions,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { LoadingOverlay } from '@bigcommerce/checkout/ui';

import { getSquareV2 } from './mocks/squarev2-method.mock';
import SquareV2PaymentMethod from './SquareV2PaymentMethod';

describe('SquareV2 payment method', () => {
    let checkoutService: CheckoutService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let deinitializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentRequestOptions]
    >;
    let checkoutState: CheckoutSelectors;
    let props: PaymentMethodProps;
    let SquareV2PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        checkoutState = checkoutService.getState();
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        props = {
            method: getSquareV2(),
            checkoutService,
            checkoutState,
            paymentForm: { disableSubmit: jest.fn() } as unknown as PaymentFormService,
            language: jest.fn() as unknown as LanguageService,
            onUnhandledError: jest.fn(),
        };
        SquareV2PaymentMethodTest = () => <SquareV2PaymentMethod {...props} />;

        const placeholderElement = document.createElement('div');

        placeholderElement.style.backgroundColor = 'rgb(1, 1, 1)';
        placeholderElement.style.borderColor = 'rgb(2, 2, 2)';
        placeholderElement.style.borderRadius = '3px';
        placeholderElement.style.borderWidth = '4px';
        placeholderElement.style.color = 'rgb(5, 5, 5)';
        placeholderElement.style.fontSize = '6px';
        placeholderElement.style.fontWeight = 'normal';

        jest.spyOn(document, 'querySelector').mockReturnValue(placeholderElement);
    });

    it('should render a loading overlay', () => {
        const loadingOverlay = mount(<SquareV2PaymentMethodTest />).find(LoadingOverlay);

        expect(loadingOverlay).toHaveLength(1);
    });

    it('should render placeholder form fields', () => {
        const placeholderForm = mount(<SquareV2PaymentMethodTest />).find(
            '[data-test="squarev2_placeholder_form"]',
        );

        expect(placeholderForm).toMatchSnapshot();
    });

    it('should be initialized with the required config', () => {
        mount(<SquareV2PaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
                squarev2: {
                    containerId: 'squarev2_payment_element_container',
                    style: {
                        input: {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal',
                        },
                        'input.is-focus': {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal',
                        },
                        'input.is-error': { color: 'rgb(5, 5, 5)' },
                        '.input-container': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderRadius: '3px',
                            borderWidth: '4px',
                        },
                        '.input-container.is-focus': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderWidth: '4px',
                        },
                        '.input-container.is-error': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderWidth: '4px',
                        },
                        '.message-text': { color: 'rgb(5, 5, 5)' },
                        '.message-icon': { color: 'rgb(5, 5, 5)' },
                        '.message-text.is-error': { color: 'rgb(5, 5, 5)' },
                        '.message-icon.is-error': { color: 'rgb(5, 5, 5)' },
                    },
                    onValidationChange: expect.any(Function),
                },
            }),
        );
    });

    it('should be initialized without style', () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);

        mount(<SquareV2PaymentMethodTest />);

        expect(initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
                squarev2: {
                    containerId: 'squarev2_payment_element_container',
                    style: undefined,
                    onValidationChange: expect.any(Function),
                },
            }),
        );
    });

    it('should enable submit button', () => {
        const {
            paymentForm: { disableSubmit },
            method,
        } = props;

        mount(<SquareV2PaymentMethodTest />);

        const onValidationChange = initializePayment.mock.calls[0][0].squarev2?.onValidationChange;

        act(() => {
            if (onValidationChange) {
                onValidationChange(true);
            }
        });

        expect(disableSubmit).toHaveBeenCalledTimes(2);
        expect(disableSubmit).toHaveBeenNthCalledWith(1, method, true);
        expect(disableSubmit).toHaveBeenNthCalledWith(2, method, false);
    });

    it('should be deinitialized with the required config', () => {
        mount(<SquareV2PaymentMethodTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
            }),
        );
    });
});
