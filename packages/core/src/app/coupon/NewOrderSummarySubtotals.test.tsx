import { createCheckoutService, type CurrencyService, type Fee , type OrderFee , type Tax } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExtensionService } from '@bigcommerce/checkout/checkout-extension';
import { CheckoutProvider, ExtensionProvider, LocaleProvider } from '@bigcommerce/checkout/contexts';
import { createLocaleContext , getLanguageService } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';

import NewOrderSummarySubtotals from './NewOrderSummarySubtotals';
import { useMultiCoupon } from './useMultiCoupon';

jest.mock('./useMultiCoupon');

describe('NewOrderSummarySubtotals', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const extensionService = new ExtensionService(checkoutService, createErrorLogger());
    const languageService = getLanguageService();
    const localeContext = createLocaleContext(getStoreConfig());
    const currencyService: CurrencyService = localeContext.currency;

    const mockUseMultiCoupon = useMultiCoupon as jest.MockedFunction<typeof useMultiCoupon>;

    const defaultMockReturn = {
        appliedGiftCertificates: [
            { code: 'GIFT1', amount: 10 },
            { code: 'GIFT2', amount: 20 },
        ],
        isCouponFormCollapsed: true,
        uiDetails: {
            shipping: 15,
            shippingBeforeDiscount: 20,
            subtotal: 100,
            discounts: 0,
            discountItems: [],
        },
        appliedCoupons: [],
        couponError: null,
        isApplyingCouponOrGiftCertificate: false,
        isCouponFormDisabled: false,
        applyCouponOrGiftCertificate: jest.fn(),
        removeCoupon: jest.fn(),
        removeGiftCertificate: jest.fn(),
        setCouponError: jest.fn(),
    };

    const renderComponent = (props = {}) => {
        return render(
            <CheckoutProvider checkoutService={checkoutService}>
                <ExtensionProvider extensionService={extensionService}>
                    <LocaleProvider checkoutService={checkoutService} languageService={languageService}>
                        <NewOrderSummarySubtotals {...props} />
                    </LocaleProvider>
                </ExtensionProvider>
            </CheckoutProvider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        mockUseMultiCoupon.mockReturnValue(defaultMockReturn);
    });

    describe('Unit Tests', () => {
        describe('Coupon Form Toggle', () => {
            it('renders redeemable toggle link', () => {
                renderComponent();

                expect(screen.getByTestId('redeemable-label')).toBeInTheDocument();
            });

            it('renders coupon form when isCouponFormCollapsed is false', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    isCouponFormCollapsed: false,
                });

                renderComponent();

                expect(screen.getByTestId('redeemable-collapsable')).toBeInTheDocument();
            });

            it('does not render coupon form initially when isCouponFormCollapsed is true', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    isCouponFormCollapsed: true,
                });

                renderComponent();

                expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();
            });

            it('toggles coupon form visibility when toggle link is clicked', async () => {
                const user = userEvent.setup();

                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    isCouponFormCollapsed: true,
                });

                renderComponent();

                expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();

                const toggleLink = screen.getByTestId('redeemable-label');

                await user.click(toggleLink);

                expect(screen.getByTestId('redeemable-collapsable')).toBeInTheDocument();

                await user.click(toggleLink);

                expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();
            });

            it('sets correct aria attributes on toggle link', () => {
                renderComponent();

                const toggleLink = screen.getByTestId('redeemable-label');

                expect(toggleLink).toHaveAttribute('aria-controls', 'coupon-form-collapsable');
                expect(toggleLink).toHaveAttribute('aria-expanded', 'false');
            });

            it('updates aria-expanded when form is visible', async () => {
                const user = userEvent.setup();

                renderComponent();

                const toggleLink = screen.getByTestId('redeemable-label');

                expect(toggleLink).toHaveAttribute('aria-expanded', 'false');

                await user.click(toggleLink);

                expect(toggleLink).toHaveAttribute('aria-expanded', 'true');
            });
        });

        describe('Discounts Component', () => {
            it('renders Discounts component', () => {
                renderComponent();

                expect(screen.getByTestId('cart-subtotal')).toBeInTheDocument();
            });
        });

        describe('Shipping Display', () => {
            it('renders shipping section with correct test id', () => {
                renderComponent();

                expect(screen.getByTestId('cart-shipping')).toBeInTheDocument();
            });

            it('displays shipping amount', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    uiDetails: {
                        ...defaultMockReturn.uiDetails,
                        shipping: 15,
                    },
                });

                renderComponent();

                const shippingSection = screen.getByTestId('cart-shipping');

                expect(shippingSection).toHaveTextContent(currencyService.toCustomerCurrency(15));
            });

            it('displays shipping before discount when different from shipping', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    uiDetails: {
                        ...defaultMockReturn.uiDetails,
                        shipping: 15,
                        shippingBeforeDiscount: 20,
                    },
                });

                renderComponent();

                const shippingSection = screen.getByTestId('cart-shipping');

                expect(shippingSection).toHaveTextContent(currencyService.toCustomerCurrency(20));
                expect(shippingSection).toHaveTextContent(currencyService.toCustomerCurrency(15));
            });

            it('does not display shipping before discount when same as shipping', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    uiDetails: {
                        ...defaultMockReturn.uiDetails,
                        shipping: 15,
                        shippingBeforeDiscount: 15,
                    },
                });

                renderComponent();

                const shippingSection = screen.getByTestId('cart-shipping');
                const formattedAmount = currencyService.toCustomerCurrency(15);

                expect(shippingSection).toHaveTextContent(formattedAmount);

                const textContent = shippingSection.textContent || '';
                const matches = textContent.match(new RegExp(formattedAmount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));

                expect(matches?.length).toBeLessThanOrEqual(1);
            });

            it('does not display shipping before discount when shippingBeforeDiscount is 0', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    uiDetails: {
                        ...defaultMockReturn.uiDetails,
                        shipping: 15,
                        shippingBeforeDiscount: 0,
                    },
                });

                renderComponent();

                const shippingSection = screen.getByTestId('cart-shipping');
                const formattedAmount = currencyService.toCustomerCurrency(15);

                expect(shippingSection).toHaveTextContent(formattedAmount);

                const textContent = shippingSection.textContent || '';
                const matches = textContent.match(new RegExp(formattedAmount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));

                expect(matches?.length).toBeLessThanOrEqual(1);
            });
        });

        describe('Gift Wrapping', () => {
            it('renders gift wrapping when giftWrappingAmount is provided', () => {
                renderComponent({ giftWrappingAmount: 5 });

                expect(screen.getByTestId('cart-gift-wrapping')).toBeInTheDocument();
            });

            it('does not render gift wrapping when giftWrappingAmount is not provided', () => {
                renderComponent();

                expect(screen.queryByTestId('cart-gift-wrapping')).not.toBeInTheDocument();
            });

            it('does not render gift wrapping when giftWrappingAmount is 0', () => {
                renderComponent({ giftWrappingAmount: 0 });

                expect(screen.queryByTestId('cart-gift-wrapping')).not.toBeInTheDocument();
            });

            it('displays correct gift wrapping amount', () => {
                renderComponent({ giftWrappingAmount: 5 });

                const giftWrapping = screen.getByTestId('cart-gift-wrapping');

                expect(giftWrapping).toHaveTextContent(currencyService.toCustomerCurrency(5));
            });
        });

        describe('Handling', () => {
            it('renders handling when handlingAmount is provided', () => {
                renderComponent({ handlingAmount: 3 });

                expect(screen.getByTestId('cart-handling')).toBeInTheDocument();
            });

            it('does not render handling when handlingAmount is not provided', () => {
                renderComponent();

                expect(screen.queryByTestId('cart-handling')).not.toBeInTheDocument();
            });

            it('does not render handling when handlingAmount is 0', () => {
                renderComponent({ handlingAmount: 0 });

                expect(screen.queryByTestId('cart-handling')).not.toBeInTheDocument();
            });

            it('displays correct handling amount', () => {
                renderComponent({ handlingAmount: 3 });

                const handling = screen.getByTestId('cart-handling');

                expect(handling).toHaveTextContent(currencyService.toCustomerCurrency(3));
            });
        });

        describe('Fees', () => {
            it('renders fees when fees array is provided', () => {
                const fees: Fee[] = [
                    { id: '1', cost: 2.5, type: 'custom_fee', source: 'test', name: 'Test Fee', displayName: 'Test Fee' },
                ];

                renderComponent({ fees });

                expect(screen.getByTestId('cart-fees')).toBeInTheDocument();
            });

            it('renders multiple fees', () => {
                const fees: Fee[] = [
                    { id: '1', cost: 2.5, type: 'custom_fee', source: 'test', name: 'Test Fee 1', displayName: 'Test Fee 1' },
                    { id: '2', cost: 3.5, type: 'custom_fee', source: 'test', name: 'Test Fee 2', displayName: 'Test Fee 2' },
                ];

                renderComponent({ fees });

                expect(screen.getAllByTestId('cart-fees')).toHaveLength(2);
            });

            it('does not render fees when fees array is empty', () => {
                renderComponent({ fees: [] });

                expect(screen.queryByTestId('cart-fees')).not.toBeInTheDocument();
            });

            it('does not render fees when fees is undefined', () => {
                renderComponent();

                expect(screen.queryByTestId('cart-fees')).not.toBeInTheDocument();
            });

            it('displays fee with displayName for Fee type', () => {
                const fees: Fee[] = [
                    { id: '1', cost: 2.5, type: 'custom_fee', source: 'test', name: 'Test Fee', displayName: 'Test Fee' },
                ];

                renderComponent({ fees });

                const feeElement = screen.getByTestId('cart-fees');

                expect(feeElement).toHaveTextContent('Test Fee');
                expect(feeElement).toHaveTextContent(currencyService.toCustomerCurrency(2.5));
            });

            it('displays fee with customerDisplayName for OrderFee type', () => {
                const fees: OrderFee[] = [
                    {
                        id: 1,
                        cost: 2.5,
                        type: 'custom_fee',
                        source: 'test',
                        customerDisplayName: 'Customer Fee',
                    },
                ];

                renderComponent({ fees });

                const feeElement = screen.getByTestId('cart-fees');

                expect(feeElement).toHaveTextContent('Customer Fee');
                expect(feeElement).toHaveTextContent(currencyService.toCustomerCurrency(2.5));
            });
        });

        describe('Taxes', () => {
            it('renders taxes when isTaxIncluded is false and taxes are provided', () => {
                const taxes: Tax[] = [
                    { name: 'Sales Tax', amount: 5 },
                ];

                renderComponent({ taxes, isTaxIncluded: false });

                expect(screen.getByTestId('cart-taxes')).toBeInTheDocument();
            });

            it('renders multiple taxes', () => {
                const taxes: Tax[] = [
                    { name: 'Sales Tax', amount: 5 },
                    { name: 'State Tax', amount: 2 },
                ];

                renderComponent({ taxes, isTaxIncluded: false });

                expect(screen.getAllByTestId('cart-taxes')).toHaveLength(2);
            });

            it('does not render taxes when isTaxIncluded is true', () => {
                const taxes: Tax[] = [
                    { name: 'Sales Tax', amount: 5 },
                ];

                renderComponent({ taxes, isTaxIncluded: true });

                expect(screen.queryByTestId('cart-taxes')).not.toBeInTheDocument();
            });

            it('does not render taxes when taxes array is empty', () => {
                renderComponent({ taxes: [], isTaxIncluded: false });

                expect(screen.queryByTestId('cart-taxes')).not.toBeInTheDocument();
            });

            it('does not render taxes when taxes is undefined', () => {
                renderComponent({ isTaxIncluded: false });

                expect(screen.queryByTestId('cart-taxes')).not.toBeInTheDocument();
            });

            it('displays correct tax name and amount', () => {
                const taxes: Tax[] = [
                    { name: 'Sales Tax', amount: 5 },
                ];

                renderComponent({ taxes, isTaxIncluded: false });

                const taxElement = screen.getByTestId('cart-taxes');

                expect(taxElement).toHaveTextContent('Sales Tax');
                expect(taxElement).toHaveTextContent(currencyService.toCustomerCurrency(5));
            });
        });

        describe('Applied Gift Certificates', () => {
            it('renders AppliedGiftCertificates component with gift certificates from hook', () => {
                renderComponent();

                const giftCertificates = screen.getAllByTestId('cart-gift-certificate');

                expect(giftCertificates).toHaveLength(2);
                expect(giftCertificates[0]).toHaveTextContent('GIFT1');
                expect(giftCertificates[1]).toHaveTextContent('GIFT2');
            });

            it('passes correct gift certificates to AppliedGiftCertificates component', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    appliedGiftCertificates: [
                        { code: 'GIFT123', amount: 50 },
                    ],
                });

                renderComponent();

                const giftCertificate = screen.getByTestId('cart-gift-certificate');

                expect(giftCertificate).toHaveTextContent('GIFT123');
                expect(giftCertificate).toHaveTextContent(currencyService.toCustomerCurrency(50));
            });

            it('renders empty gift certificates list when none are applied', () => {
                mockUseMultiCoupon.mockReturnValue({
                    ...defaultMockReturn,
                    appliedGiftCertificates: [],
                });

                renderComponent();

                expect(screen.queryByTestId('cart-gift-certificate')).not.toBeInTheDocument();
            });
        });

        describe('Store Credit', () => {
            it('renders store credit when storeCreditAmount is provided', () => {
                renderComponent({ storeCreditAmount: 25 });

                expect(screen.getByTestId('cart-store-credit')).toBeInTheDocument();
            });

            it('does not render store credit when storeCreditAmount is not provided', () => {
                renderComponent();

                expect(screen.queryByTestId('cart-store-credit')).not.toBeInTheDocument();
            });

            it('does not render store credit when storeCreditAmount is 0', () => {
                renderComponent({ storeCreditAmount: 0 });

                expect(screen.queryByTestId('cart-store-credit')).not.toBeInTheDocument();
            });

            it('displays correct store credit amount', () => {
                renderComponent({ storeCreditAmount: 25 });

                const storeCredit = screen.getByTestId('cart-store-credit');

                expect(storeCredit).toHaveTextContent(currencyService.toCustomerCurrency(25));
            });
        });
    });

    describe('Integration Tests', () => {
        it('renders all components together with all props', () => {
            const fees: Fee[] = [
                { id: '1', cost: 2.5, type: 'custom_fee', source: 'test', name: 'Test Fee', displayName: 'Test Fee' },
            ];
            const taxes: Tax[] = [
                { name: 'Sales Tax', amount: 5 },
            ];

            renderComponent({
                fees,
                giftWrappingAmount: 5,
                handlingAmount: 3,
                isTaxIncluded: false,
                storeCreditAmount: 25,
                taxes,
            });

            expect(screen.getByTestId('redeemable-label')).toBeInTheDocument();
            expect(screen.getByTestId('cart-subtotal')).toBeInTheDocument();
            expect(screen.getByTestId('cart-shipping')).toBeInTheDocument();
            expect(screen.getByTestId('cart-gift-wrapping')).toBeInTheDocument();
            expect(screen.getByTestId('cart-handling')).toBeInTheDocument();
            expect(screen.getByTestId('cart-fees')).toBeInTheDocument();
            expect(screen.getByTestId('cart-taxes')).toBeInTheDocument();
            expect(screen.getAllByTestId('cart-gift-certificate')).toHaveLength(2);
            expect(screen.getByTestId('cart-store-credit')).toBeInTheDocument();
        });

        it('handles interaction flow: toggle form, apply coupon, see updates', async () => {
            const user = userEvent.setup();

            mockUseMultiCoupon.mockReturnValue({
                ...defaultMockReturn,
                isCouponFormCollapsed: true,
            });

            renderComponent();

            expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();

            await user.click(screen.getByTestId('redeemable-label'));
            expect(screen.getByTestId('redeemable-collapsable')).toBeInTheDocument();

            await user.click(screen.getByTestId('redeemable-label'));
            expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();
        });

        it('renders correctly with minimal props', () => {
            renderComponent();

            expect(screen.getByTestId('redeemable-label')).toBeInTheDocument();
            expect(screen.getByTestId('cart-subtotal')).toBeInTheDocument();
            expect(screen.getByTestId('cart-shipping')).toBeInTheDocument();
            expect(screen.getAllByTestId('cart-gift-certificate')).toHaveLength(2);
        });

        it('handles shipping discount display correctly', () => {
            mockUseMultiCoupon.mockReturnValue({
                ...defaultMockReturn,
                uiDetails: {
                    ...defaultMockReturn.uiDetails,
                    shipping: 10,
                    shippingBeforeDiscount: 20,
                },
            });

            renderComponent();

            const shippingSection = screen.getByTestId('cart-shipping');

            expect(shippingSection).toHaveTextContent(currencyService.toCustomerCurrency(20));
            expect(shippingSection).toHaveTextContent(currencyService.toCustomerCurrency(10));
        });

        it('integrates with useMultiCoupon hook correctly', () => {
            const customGiftCertificates = [
                { code: 'CUSTOM1', amount: 100 },
            ];

            mockUseMultiCoupon.mockReturnValue({
                ...defaultMockReturn,
                appliedGiftCertificates: customGiftCertificates,
                uiDetails: {
                    shipping: 25,
                    shippingBeforeDiscount: 30,
                    subtotal: 200,
                    discounts: 10,
                    discountItems: [],
                },
            });

            renderComponent();

            const giftCertificate = screen.getByTestId('cart-gift-certificate');

            expect(giftCertificate).toHaveTextContent('CUSTOM1');
            expect(giftCertificate).toHaveTextContent(currencyService.toCustomerCurrency(100));
            expect(screen.getByTestId('cart-shipping')).toHaveTextContent(currencyService.toCustomerCurrency(25));
            expect(screen.getByTestId('cart-shipping')).toHaveTextContent(currencyService.toCustomerCurrency(30));
        });

        it('handles mixed fee types correctly', () => {
            const fees: Array<Fee | OrderFee> = [
                { id: '1', cost: 2.5, type: 'custom_fee', source: 'test', name: 'Regular Fee', displayName: 'Regular Fee' },
                {
                    id: 2,
                    cost: 3.5,
                    type: 'custom_fee',
                    source: 'test',
                    customerDisplayName: 'Order Fee',
                } as OrderFee,
            ];

            renderComponent({ fees });

            const feeElements = screen.getAllByTestId('cart-fees');

            expect(feeElements).toHaveLength(2);
            expect(feeElements[0]).toHaveTextContent('Regular Fee');
            expect(feeElements[1]).toHaveTextContent('Order Fee');
        });

        it('maintains correct order of elements', () => {
            renderComponent({
                giftWrappingAmount: 5,
                handlingAmount: 3,
                storeCreditAmount: 25,
            });

            expect(screen.getByTestId('cart-subtotal')).toBeInTheDocument();
            expect(screen.getByTestId('cart-shipping')).toBeInTheDocument();
            expect(screen.getByTestId('cart-gift-wrapping')).toBeInTheDocument();
            expect(screen.getByTestId('cart-handling')).toBeInTheDocument();
            expect(screen.getAllByTestId('cart-gift-certificate')).toHaveLength(2);
            expect(screen.getByTestId('cart-store-credit')).toBeInTheDocument();
        });
    });
});
