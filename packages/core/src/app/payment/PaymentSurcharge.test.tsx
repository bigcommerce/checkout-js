/**
 * PI-5797 (provider-agnostic): per the backend spike a surcharge is applied as a custom fee
 * (Fees API) after the payment attempt, and the checkout is then reloaded. That total change must
 * not wipe what the shopper has already typed into the card form.
 *
 * `initializePayment` / `deinitializePayment` are stubbed on purpose. We measure the React
 * lifecycle of the generic card component, not any specific provider. A provider whose card
 * fields live in an iframe loses its data exactly when its strategy is deinitialized, so
 * "deinitializePayment not called + same DOM node" is the signal we are after.
 */
import {
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import { http, HttpResponse } from 'msw';
import React, { act, type FunctionComponent } from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import {
    AnalyticsProviderMock,
    CheckoutProvider,
    ExtensionProvider,
    LocaleProvider,
    ThemeProvider,
} from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';
import { CHECKOUT_ROOT_NODE_ID } from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutWithBillingEmail,
    checkoutWithShippingAndBilling,
    payments,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

import { requestSurcharge } from './surcharge/requestSurcharge';

jest.mock('@bigcommerce/checkout/dom-utils', () => ({
    ...jest.requireActual('@bigcommerce/checkout/dom-utils'),
    replaceLocation: jest.fn(),
}));

jest.mock('./surcharge/requestSurcharge', () => ({
    requestSurcharge: jest.fn(),
}));

describe('Payment step: card form vs. total change and surcharge (PI-5797)', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps;

    // A generic, non-hosted card method (plain inputs rendered by CreditCardPaymentMethod).
    const baseCardMethod = payments.find(({ id }) => id === 'bigpaypay');

    if (!baseCardMethod) {
        throw new Error('bigpaypay mock not found');
    }

    const cardMethod = {
        ...baseCardMethod,
        clientToken: 'pf-token-1',
        config: { ...baseCardMethod.config, displayName: 'Card', isHostedFormEnabled: false },
    };

    const mockCardMethod = (getMethod: () => typeof cardMethod) =>
        checkout.setRequestHandler(
            http.get('/api/storefront/payments', () => HttpResponse.json([getMethod()])),
        );

    const updateCheckoutWith = async (overrides: Record<string, unknown>) => {
        checkout.updateCheckout('put', '/checkout/*', {
            ...checkoutWithShippingAndBilling,
            ...overrides,
        });

        await act(async () => {
            await checkoutService.updateCheckout({ customerMessage: 'surcharge applied' });
        });
    };

    beforeAll(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();
    });

    afterEach(() => {
        checkout.resetHandlers();
        sessionStorage.clear();
    });

    afterAll(() => {
        checkout.close();
    });

    beforeEach(() => {
        window.scrollTo = jest.fn();

        checkoutService = createCheckoutService();

        const embeddedMessenger = createEmbeddedCheckoutMessenger({
            parentOrigin: 'https://store.url',
        });
        const extensionService = new ExtensionService(checkoutService, createErrorLogger());

        defaultProps = {
            checkoutId: checkoutWithBillingEmail.id,
            containerId: CHECKOUT_ROOT_NODE_ID,
            createEmbeddedMessenger: () => embeddedMessenger,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            embeddedSupport: createEmbeddedCheckoutSupport(getLanguageService()),
            errorLogger: createErrorLogger(),
        };

        jest.spyOn(defaultProps.errorLogger, 'log').mockImplementation(noop);

        CheckoutTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider
                    checkoutService={checkoutService}
                    languageService={getLanguageService()}
                >
                    <AnalyticsProviderMock
                        analyticsTracker={{
                            selectedPaymentMethod: jest.fn(),
                            clickPayButton: jest.fn(),
                            paymentRejected: jest.fn(),
                            paymentComplete: jest.fn(),
                        }}
                    >
                        <ExtensionProvider extensionService={extensionService}>
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    const setUpCardStep = async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        const initializeSpy = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutService.getState());
        const deinitializeSpy = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutService.getState());
        const loadPaymentMethodsSpy = jest.spyOn(checkoutService, 'loadPaymentMethods');
        const submitOrderSpy = jest.spyOn(checkoutService, 'submitOrder');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        const nameOnCard = await screen.findByLabelText(/name on card/i);

        await act(async () => {
            await userEvent.type(nameOnCard, 'Monika T');
        });

        await waitFor(() => expect(initializeSpy).toHaveBeenCalled());

        return {
            nameOnCard,
            initializeSpy,
            deinitializeSpy,
            loadPaymentMethodsSpy,
            submitOrderSpy,
            initCallsBefore: initializeSpy.mock.calls.length,
            deinitCallsBefore: deinitializeSpy.mock.calls.length,
            loadCallsBefore: loadPaymentMethodsSpy.mock.calls.length,
        };
    };

    it('keeps typed card data and does not re-initialize the card method when only the total changes', async () => {
        mockCardMethod(() => cardMethod);

        const ctx = await setUpCardStep();

        await updateCheckoutWith({ grandTotal: checkoutWithShippingAndBilling.grandTotal + 6.18 });

        // The payment step DID reload (this is the behaviour under investigation)...
        await waitFor(() =>
            expect(ctx.loadPaymentMethodsSpy.mock.calls.length).toBeGreaterThan(
                ctx.loadCallsBefore,
            ),
        );

        // ...but the card form was neither torn down nor re-initialized...
        expect(ctx.initializeSpy).toHaveBeenCalledTimes(ctx.initCallsBefore);
        expect(ctx.deinitializeSpy).toHaveBeenCalledTimes(ctx.deinitCallsBefore);

        // ...and what the shopper typed is still in the very same DOM node.
        expect(screen.getByLabelText(/name on card/i)).toBe(ctx.nameOnCard);
        expect(ctx.nameOnCard).toHaveValue('Monika T');
    });

    it('keeps typed card data when the reloaded method also carries new data (e.g. surcharge text)', async () => {
        let methodVersion = 0;

        // Second and later loads return a *different* method object (new initializationData),
        // which is what a provider-specific surcharge payload would look like.
        mockCardMethod(() => {
            const method =
                methodVersion === 0
                    ? cardMethod
                    : {
                          ...cardMethod,
                          initializationData: { surcharge: { rate: 3, text: 'Visa surcharge 3%' } },
                      };

            methodVersion++;

            return method as typeof cardMethod;
        });

        const ctx = await setUpCardStep();

        await updateCheckoutWith({ grandTotal: checkoutWithShippingAndBilling.grandTotal + 6.18 });

        await waitFor(() =>
            expect(ctx.loadPaymentMethodsSpy.mock.calls.length).toBeGreaterThan(
                ctx.loadCallsBefore,
            ),
        );

        expect(
            checkoutService.getState().data.getPaymentMethod('bigpaypay')?.initializationData,
        ).toEqual({ surcharge: { rate: 3, text: 'Visa surcharge 3%' } });

        expect(ctx.initializeSpy).toHaveBeenCalledTimes(ctx.initCallsBefore);
        expect(ctx.deinitializeSpy).toHaveBeenCalledTimes(ctx.deinitCallsBefore);
        expect(screen.getByLabelText(/name on card/i)).toBe(ctx.nameOnCard);
        expect(ctx.nameOnCard).toHaveValue('Monika T');
    });
    describe('when a surcharge is applied as a custom fee (Fees API)', () => {
        const surchargeAmount = 6.18;
        const withSurchargeFee = {
            grandTotal: checkoutWithShippingAndBilling.grandTotal + surchargeAmount,
            outstandingBalance: checkoutWithShippingAndBilling.outstandingBalance + surchargeAmount,
            fees: [
                {
                    id: 'surcharge-1',
                    type: 'custom_fee',
                    name: 'Card surcharge',
                    displayName: 'Card surcharge',
                    cost: surchargeAmount,
                    source: 'payment_surcharge',
                },
            ],
        };

        it('shows the fee as a highlighted surcharge line in the order summary', async () => {
            mockCardMethod(() => cardMethod);

            await setUpCardStep();

            expect(screen.queryByTestId('cart-surcharge')).not.toBeInTheDocument();

            await updateCheckoutWith(withSurchargeFee);

            expect(await screen.findByTestId('cart-surcharge')).toHaveTextContent('Card surcharge');
        });

        it('does not reload the payment step when only the surcharge changed the total, and keeps the card data', async () => {
            mockCardMethod(() => cardMethod);

            const ctx = await setUpCardStep();

            await updateCheckoutWith(withSurchargeFee);

            expect(await screen.findByTestId('cart-surcharge')).toBeInTheDocument();
            expect(ctx.loadPaymentMethodsSpy.mock.calls.length).toBe(ctx.loadCallsBefore);
            expect(ctx.initializeSpy).toHaveBeenCalledTimes(ctx.initCallsBefore);
            expect(ctx.deinitializeSpy).toHaveBeenCalledTimes(ctx.deinitCallsBefore);
            expect(screen.getByLabelText(/name on card/i)).toBe(ctx.nameOnCard);
            expect(ctx.nameOnCard).toHaveValue('Monika T');
        });
    });
    describe('surcharge UI (dev mock on)', () => {
        const originalEnv = process.env.NODE_ENV;

        beforeEach(() => {
            process.env.NODE_ENV = 'development';
            localStorage.setItem('surchargeMock', '1');
        });

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
            localStorage.clear();
        });

        it('sends only the pfToken once a card is entered and shows what the backend answers, before Place order', async () => {
            (requestSurcharge as jest.Mock).mockResolvedValue({
                eligible: true,
                amount: 6.18,
                rate: 3,
                currency: 'USD',
                legalText: 'Legal text from the backend',
            });
            mockCardMethod(() => cardMethod);

            const ctx = await setUpCardStep();

            await act(async () => {
                await userEvent.type(
                    screen.getByLabelText(/credit card number/i),
                    '4242424242424242',
                );
            });

            expect(await screen.findByTestId('surcharge-result')).toHaveTextContent(
                'Legal text from the backend',
            );
            expect(requestSurcharge).toHaveBeenCalledTimes(1);
            expect(requestSurcharge).toHaveBeenCalledWith({
                checkoutId: expect.any(String),
                paymentMethod: expect.objectContaining({ id: expect.any(String) }),
                pfToken: 'pf-token-1',
            });
            expect(ctx.submitOrderSpy).not.toHaveBeenCalled();
        });

        it('shows the surcharge notice and the enter-card hint with the card form', async () => {
            mockCardMethod(() => cardMethod);

            await setUpCardStep();

            expect(await screen.findByTestId('surcharge-notice')).toBeInTheDocument();
            expect(screen.getByTestId('surcharge-submit-hint')).toBeInTheDocument();
        });
    });
});
