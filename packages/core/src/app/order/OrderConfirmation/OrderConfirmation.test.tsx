import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { type AnalyticsEvents, AnalyticsProviderMock , ThemeProvider } from '@bigcommerce/checkout/contexts';
import { createLocaleContext, type LocaleContextType, LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { renderWithoutWrapper as render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import { createErrorLogger } from '../../common/error';
import { getStoreConfig } from '../../config/config.mock';
import { createEmbeddedCheckoutStylesheet } from '../../embeddedCheckout';
import { type CreatedCustomer } from '../../guestSignup';
import { getGatewayOrderPayment, getOrder } from '../orders.mock';

import { OrderConfirmation, type OrderConfirmationProps } from './OrderConfirmation';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).*$/;

// Function to make sure faker generates valid password as per regex
const generateValidPassword = () => {
    let password = '';

    do {
        password = faker.internet.password();
    } while (!passwordRegex.test(password));

    return password;
}

describe('OrderConfirmation', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: OrderConfirmationProps;
    let ComponentTest: FunctionComponent<OrderConfirmationProps>;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: Partial<AnalyticsEvents>;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        analyticsTracker = {
            orderPurchased: jest.fn(),
        };
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({
            parentOrigin: getStoreConfig().links.siteLink,
        });
        localeContext = createLocaleContext(getStoreConfig())

        jest.spyOn(checkoutService, 'loadOrder').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(false);

        jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue(getOrder());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        defaultProps = {
            containerId: 'app',
            createAccount: jest.fn(() => Promise.resolve({} as CreatedCustomer)),
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            errorLogger: createErrorLogger(),
            orderId: 105,
        };

        ComponentTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <AnalyticsProviderMock analyticsTracker={analyticsTracker}>
                        <ExtensionProvider checkoutService={checkoutService} errorLogger={{
                            log: jest.fn(),
                        }}>
                            <ThemeProvider>
                                <OrderConfirmation {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('calls trackOrderComplete when config is ready', async () => {
        render(<ComponentTest {...defaultProps} />);

        await waitFor(() => {
            expect(analyticsTracker.orderPurchased).toHaveBeenCalled();
        });
    });

    it('loads passed order ID', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(true);

        render(<ComponentTest {...defaultProps} />);

        expect(checkoutService.loadOrder).toHaveBeenCalledWith(105);
        expect(screen.getByTestId('order-confirmation-page-skeleton')).toBeInTheDocument();
    });

    it('posts message to parent of embedded checkout when order is loaded', async () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingOrder').mockReturnValue(true);
        jest.spyOn(embeddedMessengerMock, 'postFrameLoaded').mockImplementation();

        render(<ComponentTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(embeddedMessengerMock.postFrameLoaded).toHaveBeenCalledWith({
            contentId: defaultProps.containerId,
        });
    });

    it('attaches additional styles for embedded checkout', async () => {
        const styles = { text: { color: '#000' } };

        jest.spyOn(embeddedMessengerMock, 'receiveStyles').mockImplementation((fn) => fn(styles));
        jest.spyOn(defaultProps.embeddedStylesheet, 'append').mockImplementation();

        render(<ComponentTest {...defaultProps} />);

        await waitFor(() => {
            expect(defaultProps.embeddedStylesheet.append).toHaveBeenCalledWith(styles);
        });
    });

    it('renders confirmation page once loading is finished', async () => {
        const order = getOrder();

        const { container } = render(<ComponentTest {...defaultProps} />);

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        expect(container.getElementsByClassName('orderConfirmation')).toHaveLength(1);
        expect(screen.getByText(localeContext.language.translate('order_confirmation.thank_you_customer_heading', {
            name: order.billingAddress.firstName,
        }))).toBeInTheDocument();
        expect(screen.getByText(localeContext.language.translate('customer.create_account_text'))).toBeInTheDocument();
        expect(screen.getByTestId('payment-instructions').innerHTML).toBe(getGatewayOrderPayment().detail.instructions);
    });

    it('renders create account form, fills in the form and submit data', async () => {
        const password = generateValidPassword();

        render(<ComponentTest {...defaultProps} />);

        expect(screen.getByText(localeContext.language.translate('customer.create_account_text'))).toBeInTheDocument();

        const passwordField = screen.getByLabelText(localeContext.language.translate('customer.password_minimum_character_label'), { exact: false });
        const confirmPasswordField = screen.getByLabelText(localeContext.language.translate('customer.password_confirmation_label'));
        const submitButton = screen.getByText(localeContext.language.translate('customer.create_account_action'));

        await userEvent.type(passwordField, password);
        await userEvent.type(confirmPasswordField, password);
        await userEvent.click(submitButton);
        await waitFor(() => expect(defaultProps.createAccount).toHaveBeenCalledWith({
            password,
            confirmPassword: password,
        }));
    });

    it('renders set password form, fills in the form and submit data', async () => {
        const password = generateValidPassword();

        jest.spyOn(checkoutState.data, 'getOrder').mockReturnValue({
            ...getOrder(),
            customerId: 1,
        });

        render(<ComponentTest {...defaultProps} />);

        expect(screen.getByText(localeContext.language.translate('customer.set_password_text'))).toBeInTheDocument();
        expect(screen.getByText(localeContext.language.translate('customer.account_created_text'))).toBeInTheDocument();
        expect(screen.getByText(localeContext.language.translate('customer.set_password_action'))).toBeInTheDocument();

        const passwordField = screen.getByLabelText(localeContext.language.translate('customer.password_minimum_character_label'), { exact: false });
        const confirmPasswordField = screen.getByLabelText(localeContext.language.translate('customer.password_confirmation_label'));
        const submitButton = screen.getByText(localeContext.language.translate('customer.set_password_action'));

        await userEvent.type(passwordField, password);
        await userEvent.type(confirmPasswordField, password);
        await userEvent.click(submitButton);
        await waitFor(() => expect(defaultProps.createAccount).toHaveBeenCalledWith({
            password,
            confirmPassword: password,
        }));
    });

    it('renders continue shopping button', async () => {
        const { container } = render(<ComponentTest {...defaultProps} />);

        expect(screen.getByText(localeContext.language.translate('order_confirmation.continue_shopping'))).toBeInTheDocument();

        // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
        const continueButtonContainer = container.getElementsByClassName('continueButtonContainer')[0];

        // eslint-disable-next-line testing-library/no-node-access
        expect(continueButtonContainer.querySelector('form')).toHaveAttribute(
            'action', getStoreConfig().links.siteLink,
        );
    });
});
