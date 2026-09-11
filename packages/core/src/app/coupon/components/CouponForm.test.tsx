import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { useMultiCoupon } from '../useMultiCoupon';
import { getUseMultiCouponMock } from '../useMultiCoupon.mock';

import { CouponForm, type CouponFormProps } from './CouponForm';

jest.mock('../useMultiCoupon');

describe('CouponForm', () => {
    const mockUseMultiCoupon = useMultiCoupon as jest.MockedFunction<typeof useMultiCoupon>;

    const defaultMockReturn = getUseMultiCouponMock();
    const handleOuterFormSubmit = jest.fn();

    const renderComponent = (props: CouponFormProps = {}) =>
        render(
            <form onSubmit={handleOuterFormSubmit}>
                <CouponForm {...props} />
            </form>,
        );

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseMultiCoupon.mockReturnValue(defaultMockReturn);
    });

    it('applies coupon code when apply button is clicked', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.type(screen.getByTestId('redeemableEntry-input'), 'COUPON10');
        await user.click(screen.getByTestId('redeemableEntry-submit'));

        expect(defaultMockReturn.applyCouponOrGiftCertificate).toHaveBeenCalledWith('COUPON10');
    });

    it('applies coupon code on enter key without submitting surrounding form', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.type(screen.getByTestId('redeemableEntry-input'), 'COUPON10{Enter}');

        expect(defaultMockReturn.applyCouponOrGiftCertificate).toHaveBeenCalledWith('COUPON10');
        expect(handleOuterFormSubmit).not.toHaveBeenCalled();
    });

    it('does not apply coupon on enter key when input is empty', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.type(screen.getByTestId('redeemableEntry-input'), '{Enter}');

        expect(defaultMockReturn.applyCouponOrGiftCertificate).not.toHaveBeenCalled();
        expect(handleOuterFormSubmit).not.toHaveBeenCalled();
    });

    it('requires a code before submitting', async () => {
        const user = userEvent.setup();

        renderComponent();

        await user.click(screen.getByTestId('redeemableEntry-submit'));

        expect(defaultMockReturn.applyCouponOrGiftCertificate).not.toHaveBeenCalled();
        expect(defaultMockReturn.setCouponError).toHaveBeenCalledWith(
            'Please enter a gift certificate or coupon code',
        );
    });

    it('sets coupon error when applying code fails', async () => {
        const user = userEvent.setup();

        jest.mocked(defaultMockReturn.applyCouponOrGiftCertificate).mockRejectedValueOnce(
            new Error('Invalid coupon code'),
        );

        renderComponent();

        await user.type(screen.getByTestId('redeemableEntry-input'), 'BADCODE');
        await user.click(screen.getByTestId('redeemableEntry-submit'));

        expect(defaultMockReturn.setCouponError).toHaveBeenCalledWith('Invalid coupon code');
    });

    it('renders coupon error message', () => {
        mockUseMultiCoupon.mockReturnValue({
            ...defaultMockReturn,
            couponError: 'Invalid coupon code',
        });

        renderComponent();

        expect(screen.getByText('Invalid coupon code')).toBeInTheDocument();
    });

    it('renders default ids without a form instance id', () => {
        renderComponent();

        expect(screen.getByTestId('redeemable-collapsable')).toHaveAttribute(
            'id',
            'coupon-form-collapsable',
        );
        expect(screen.getByTestId('redeemableEntry-input')).toHaveAttribute('id', 'redeemableCode');
        expect(screen.getByTestId('redeemableEntry-submit')).toHaveAttribute(
            'id',
            'applyRedeemableButton',
        );
    });

    it('renders prefixed ids when a form instance id is provided', () => {
        renderComponent({ formInstanceId: 'payment-' });

        expect(screen.getByTestId('redeemable-collapsable')).toHaveAttribute(
            'id',
            'payment-coupon-form-collapsable',
        );
        expect(screen.getByTestId('redeemableEntry-input')).toHaveAttribute(
            'id',
            'payment-redeemableCode',
        );
        expect(screen.getByTestId('redeemableEntry-submit')).toHaveAttribute(
            'id',
            'payment-applyRedeemableButton',
        );
    });
});
