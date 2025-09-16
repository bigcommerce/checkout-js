import { type CheckoutSelectors, type CheckoutService, createCheckoutService, type RequestError } from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import Redeemable, { type RedeemableProps } from './Redeemable';

describe('CartSummary Component', () => {
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let translate: (key: string) => string;

    const applyCoupon = jest.fn();
    const applyGiftCertificate = jest.fn();
    const clearError = jest.fn();
    const onRemovedCoupon = jest.fn();
    const onRemovedGiftCertificate = jest.fn();
    const minPurchaseError = {
        errors: [{ code: 'min_purchase' }],
    } as RequestError;
    const notApplicableError = {
        errors: [{ code: 'not_applicable' }],
    } as RequestError;
    const errorMessage = 'Specific error message';
    const appliedError = {
        errors: [{ code: '', message: errorMessage }],
    } as RequestError;
    const appliedErrorWithoutMessage = {
        errors: [{}],
    } as RequestError;
    const appliedErrorWitEmptyStringMessage = {
        errors: [{ code: '', message: '' }],
    } as RequestError;

    const RedeemableTestComponent = (props: RedeemableProps) => (
        <LocaleContext.Provider value={localeContext}>
            <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                <Redeemable {...props} />
            </CheckoutContext.Provider>
        </LocaleContext.Provider>
    );

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        translate=localeContext.language.translate;
    });

    it('renders errors when coupon code is not collapsed', () => {
        const { rerender } = render(
            <RedeemableTestComponent
                appliedRedeemableError={minPurchaseError}
                applyCoupon={applyCoupon}
                applyGiftCertificate={applyGiftCertificate}
                clearError={clearError}
                isApplyingRedeemable={true}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shouldCollapseCouponCode={false}
            />,
        );

        const submit = screen.getByTestId('redeemableEntry-submit');

        expect(submit).toHaveClass('is-loading');
        expect(submit).toBeDisabled();
        expect(screen.getByText(translate('redeemable.coupon_min_order_total'))).toBeInTheDocument();
        expect(screen.queryByTestId('redeemable-label')).not.toBeInTheDocument();
        expect(screen.getByTestId('redeemableEntry-input')).toBeInTheDocument();
        expect(screen.getByLabelText('Gift Certificate or Coupon Code')).toBeInTheDocument();

        rerender(<RedeemableTestComponent
            appliedRedeemableError={notApplicableError}
            applyCoupon={applyCoupon}
            applyGiftCertificate={applyGiftCertificate}
            clearError={clearError}
            isApplyingRedeemable={true}
            onRemovedCoupon={onRemovedCoupon}
            onRemovedGiftCertificate={onRemovedGiftCertificate}
            shouldCollapseCouponCode={false}
        />);

        expect(screen.getByText(translate('redeemable.coupon_location_error'))).toBeInTheDocument();
    });

    it('renders the generic coupon invalid error when coupon code is not collapsed and there is applied error without error message', () => {
        render(
            <RedeemableTestComponent
                appliedRedeemableError={appliedErrorWithoutMessage}
                applyCoupon={applyCoupon}
                applyGiftCertificate={applyGiftCertificate}
                clearError={clearError}
                isApplyingRedeemable={true}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shouldCollapseCouponCode={false}
            />,
        );

        expect(screen.getByText(translate('redeemable.code_invalid_error'))).toBeInTheDocument();
    });

    it('renders the generic coupon invalid error when coupon code is not collapsed and there is applied error with empty error message', () => {
        render(
            <RedeemableTestComponent
                appliedRedeemableError={appliedErrorWitEmptyStringMessage}
                applyCoupon={applyCoupon}
                applyGiftCertificate={applyGiftCertificate}
                clearError={clearError}
                isApplyingRedeemable={true}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shouldCollapseCouponCode={false}
            />,
        );

        expect(screen.getByText(translate('redeemable.code_invalid_error'))).toBeInTheDocument();
    });

    describe('when coupon code is collapsed', () => {
        const TestComponent = () => <RedeemableTestComponent
            appliedRedeemableError={appliedError}
            applyCoupon={applyCoupon}
            applyGiftCertificate={applyGiftCertificate}
            clearError={clearError}
            onRemovedCoupon={onRemovedCoupon}
            onRemovedGiftCertificate={onRemovedGiftCertificate}
            shouldCollapseCouponCode={true}
        />;

        it('renders redeemable toggle link', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('redeemable-label')).toBeInTheDocument();
            expect(screen.queryByTestId('redeemableEntry-input')).not.toBeInTheDocument();
        });

        describe('when redeemable is clicked', () => {
            it('renders error and redeemable form', async () => {
                render(<TestComponent />);

                await userEvent.click(screen.getByTestId('redeemable-label'));

                const submit = screen.getByTestId('redeemableEntry-submit');

                expect(submit).not.toHaveClass('is-loading');
                expect(submit).toBeEnabled();
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
                expect(screen.getByTestId('redeemableEntry-input')).toBeInTheDocument();

                await userEvent.click(submit);

                expect(screen.getByTestId('redeemable-code-field-error-message')).toBeInTheDocument();
            });

            it('applies a coupon with clicking Apply button', async () => {
                render(<TestComponent />);

                applyGiftCertificate.mockRejectedValue(new Error());

                await userEvent.click(screen.getByTestId('redeemable-label'));
                await userEvent.type(screen.getByTestId('redeemableEntry-input'),' foo {enter}');
                await userEvent.click(screen.getByTestId('redeemableEntry-submit'));

                expect(clearError).toHaveBeenCalledWith(appliedError);
                expect(applyCoupon).toHaveBeenCalledWith('foo');
            });
        });
    });

    it('renders error message when coupon code is collapsed and there is applied error without error message', async () => {
        render(
            <RedeemableTestComponent
                appliedRedeemableError={appliedErrorWithoutMessage}
                applyCoupon={applyCoupon}
                applyGiftCertificate={applyGiftCertificate}
                clearError={clearError}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shouldCollapseCouponCode={true}
            />,
        );

        await userEvent.click(screen.getByTestId('redeemable-label'));

        expect(screen.getByText(translate('redeemable.code_invalid_error'))).toBeInTheDocument();

        await userEvent.click(screen.getByTestId('redeemableEntry-submit'));

        expect(screen.getByTestId('redeemable-code-field-error-message')).toBeInTheDocument();
        expect(screen.getByText(translate('redeemable.code_required_error'))).toBeInTheDocument();
    });

    it('disables apply button when payment is submitting', async () => {
        const applyGiftCertificate = jest.fn();
        const applyCoupon = jest.fn();

        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.statuses, 'isSubmittingOrder').mockReturnValue(true);

        render(
            <RedeemableTestComponent
                appliedRedeemableError={minPurchaseError}
                applyCoupon={applyCoupon}
                applyGiftCertificate={applyGiftCertificate}
                clearError={clearError}
                isApplyingRedeemable={false}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shouldCollapseCouponCode={false}
            />,
        );

        const submit = screen.getByTestId('redeemableEntry-submit');

        expect(submit).not.toHaveClass('is-loading');
        expect(submit).toBeDisabled();

        await userEvent.click(submit);

        expect(applyGiftCertificate).not.toHaveBeenCalled();
    });
});
