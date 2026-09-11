import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React from 'react';

import {
    CheckoutProvider,
    defaultCapabilities,
    useCapabilities,
} from '@bigcommerce/checkout/contexts';
import { render, screen } from '@bigcommerce/checkout/test-utils';
import { MOBILE_MAX_WIDTH } from '@bigcommerce/checkout/ui';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { useMultiCoupon } from '../coupon/useMultiCoupon';
import { getUseMultiCouponMock } from '../coupon/useMultiCoupon.mock';

import PaymentRedeemables from './PaymentRedeemables';

jest.mock('../coupon/useMultiCoupon');
jest.mock('@bigcommerce/checkout/contexts', () => ({
    ...jest.requireActual('@bigcommerce/checkout/contexts'),
    useCapabilities: jest.fn(),
}));

describe('PaymentRedeemables', () => {
    const mockUseMultiCoupon = useMultiCoupon as jest.MockedFunction<typeof useMultiCoupon>;
    const mockUseCapabilities = useCapabilities as jest.MockedFunction<typeof useCapabilities>;

    let checkoutService: CheckoutService;
    let isMobile: boolean;

    const matchMedia = window.matchMedia;

    const getStoreConfigWithFlag = (isEnabled: boolean) => {
        const storeConfig = getStoreConfig();

        return {
            ...storeConfig,
            checkoutSettings: {
                ...storeConfig.checkoutSettings,
                features: {
                    ...storeConfig.checkoutSettings.features,
                    'CHECKOUT-10307.unified_payment_coupon_form': isEnabled,
                },
            },
        };
    };

    const renderComponent = (isFlagEnabled = true) => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
            getStoreConfigWithFlag(isFlagEnabled),
        );
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());

        return render(
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentRedeemables />
            </CheckoutProvider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();

        checkoutService = createCheckoutService();
        isMobile = true;

        window.matchMedia = jest.fn(
            (query) =>
                ({
                    matches:
                        query === `screen and (max-width: ${MOBILE_MAX_WIDTH}px)`
                            ? isMobile
                            : false,
                    addListener: noop,
                    addEventListener: noop,
                    removeListener: noop,
                    removeEventListener: noop,
                }) as MediaQueryList,
        );

        mockUseMultiCoupon.mockReturnValue(getUseMultiCouponMock());
        mockUseCapabilities.mockReturnValue(defaultCapabilities);
    });

    afterEach(() => {
        window.matchMedia = matchMedia;
    });

    describe('when the unified coupon form flag is enabled', () => {
        it('renders coupon form toggle inside fieldset on mobile view', () => {
            renderComponent();

            const link = screen.getByTestId('redeemable-label');

            expect(screen.getByRole('group')).toHaveClass('form-fieldset redeemable-payments');
            expect(link).toHaveAttribute('aria-controls', 'payment-coupon-form-collapsable');
            expect(link).toHaveAttribute('aria-expanded', 'false');
            expect(link).toHaveAttribute('href', '#');
            expect(link).toHaveClass('redeemable-label');
        });

        it('reveals coupon form with prefixed id when toggle is clicked', async () => {
            const user = userEvent.setup();

            renderComponent();

            expect(screen.queryByTestId('redeemable-collapsable')).not.toBeInTheDocument();

            await user.click(screen.getByTestId('redeemable-label'));

            expect(screen.getByTestId('redeemable-collapsable')).toHaveAttribute(
                'id',
                'payment-coupon-form-collapsable',
            );
        });

        it('renders coupon form initially when coupon code is not collapsed', () => {
            mockUseMultiCoupon.mockReturnValue({
                ...getUseMultiCouponMock(),
                isCouponFormCollapsed: false,
            });

            renderComponent();

            expect(screen.getByTestId('redeemable-collapsable')).toBeInTheDocument();
        });

        it('renders nothing on desktop view', () => {
            isMobile = false;

            renderComponent();

            expect(screen.queryByRole('group')).not.toBeInTheDocument();
            expect(screen.queryByTestId('redeemable-label')).not.toBeInTheDocument();
        });

        it('renders nothing when both coupon and gift certificate are disabled', () => {
            mockUseCapabilities.mockReturnValue({
                ...defaultCapabilities,
                userJourney: {
                    ...defaultCapabilities.userJourney,
                    disableCoupon: true,
                    disableGiftCertificate: true,
                },
            });

            renderComponent();

            expect(screen.queryByRole('group')).not.toBeInTheDocument();
            expect(screen.queryByTestId('redeemable-label')).not.toBeInTheDocument();
        });
    });

    describe('when the unified coupon form flag is disabled', () => {
        it('renders the legacy redeemable component', () => {
            renderComponent(false);

            const link = screen.getByRole('link', { name: 'Coupon / gift certificate' });

            expect(screen.getByRole('group')).toHaveClass('form-fieldset redeemable-payments');
            expect(link).toHaveAttribute('aria-controls', 'redeemable-collapsable');
            expect(link).toHaveAttribute('aria-expanded', 'false');
        });

        it('renders the legacy redeemable component on desktop view', () => {
            isMobile = false;

            renderComponent(false);

            expect(screen.getByRole('group')).toHaveClass('form-fieldset redeemable-payments');
        });
    });
});
