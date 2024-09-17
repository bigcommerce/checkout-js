import { CheckoutSelectors, CheckoutService, createCheckoutService, RequestError } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext, LocaleContextType, TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckoutContext } from '@bigcommerce/checkout/payment-integration-api';

import { getStoreConfig } from '../config/config.mock';
import { Alert } from '../ui/alert';

import Redeemable, { RedeemableProps } from './Redeemable';

describe('CartSummary Component', () => {
    let localeContext: LocaleContextType;
    let component: ReactWrapper;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    const applyCoupon = jest.fn();
    const applyGiftCertificate = jest.fn();
    const clearError = jest.fn();
    const onRemovedCoupon = jest.fn();
    const onRemovedGiftCertificate = jest.fn();
    const minPurchaseError = {
        errors: [{ code: 'min_purchase' }],
    } as RequestError;
    const appliedError = {
        errors: [{}],
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
    });

    describe('when coupon code is not collapsed', () => {
        beforeEach(() => {
            component = mount(
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
        });

        it('renders min purchase error', () => {
            expect(component.find(Alert).find(TranslatedString).prop('id')).toBe(
                'redeemable.coupon_min_order_total',
            );
        });

        it('does not render toggle link', () => {
            expect(component.find('[data-test="redeemable-label"]')).toHaveLength(0);
        });

        it('renders redeemable form', () => {
            expect(component.find('.redeemable-entry')).toHaveLength(1);
        });

        it('renders aria-label attribute on coupon input field', () => {
            expect(
                component.find('input[aria-label="Gift Certificate or Coupon Code"]'),
            ).toHaveLength(1);
        });

        it('adds disabled and loading state to input', () => {
            const submit = component.find('[data-test="redeemableEntry-submit"]');

            expect(submit.hasClass('is-loading')).toBe(true);

            expect(submit.prop('disabled')).toBe(true);
        });
    });

    describe('when coupon code is collapsed', () => {
        beforeEach(() => {
            component = mount(
                <RedeemableTestComponent
                    appliedRedeemableError={appliedError}
                    applyCoupon={applyCoupon}
                    applyGiftCertificate={applyGiftCertificate}
                    clearError={clearError}
                    onRemovedCoupon={onRemovedCoupon}
                    onRemovedGiftCertificate={onRemovedGiftCertificate}
                    shouldCollapseCouponCode={true}
                />,
            );
        });

        it('renders redeemable toggle link', () => {
            expect(component.find('[data-test="redeemable-label"]')).toHaveLength(1);
            expect(component.find('.redeemable-entry')).toHaveLength(0);
        });

        describe('when redeemable is clicked', () => {
            beforeEach(async () => {
                component.find('[data-test="redeemable-label"]').simulate('click');

                await new Promise((resolve) => process.nextTick(resolve));
            });

            it('renders error', () => {
                expect(component.find(Alert)).toHaveLength(1);
                expect(component.find(Alert).text()).toEqual(
                    localeContext.language.translate('redeemable.code_invalid_error'),
                );
            });

            it('renders redeemable form', () => {
                expect(component.find('.redeemable-entry')).toHaveLength(1);

                const input = component.find('[data-test="redeemableEntry-input"]');

                expect(input).toHaveLength(1);

                const submit = component.find('[data-test="redeemableEntry-submit"]');

                expect(submit).toHaveLength(1);
                expect(submit.hasClass('is-loading')).toBe(false);
                expect(submit.prop('disabled')).toBeFalsy();
            });

            it('renders form error when button is clicked', async () => {
                component.find('[data-test="redeemableEntry-submit"]').simulate('click');

                await new Promise((resolve) => process.nextTick(resolve));

                component.update();

                expect(
                    component.find('[data-test="redeemable-code-field-error-message"]'),
                ).toHaveLength(1);
            });

            describe('when input is entered', () => {
                beforeEach(async () => {
                    applyGiftCertificate.mockRejectedValue(new Error());

                    component
                        .find('[data-test="redeemableEntry-input"]')
                        .simulate('change', { target: { value: ' foo ', name: 'redeemableCode' } });

                    component
                        .find('[data-test="redeemableEntry-input"]')
                        .simulate('keyDown', { key: 'f', keyCode: 70, which: 70 });

                    await new Promise((resolve) => process.nextTick(resolve));
                });

                it('calls clear error', () => {
                    expect(clearError).toHaveBeenCalledWith(appliedError);
                });

                it('calls applyCoupon when enter is hit inside input', async () => {
                    component
                        .find('[data-test="redeemableEntry-input"]')
                        .simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13 });

                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(applyCoupon).toHaveBeenCalledWith('foo');
                });

                it('calls applyCoupon when button is clicked', async () => {
                    component.find('[data-test="redeemableEntry-submit"]').simulate('click');

                    await new Promise((resolve) => process.nextTick(resolve));

                    expect(applyGiftCertificate).toHaveBeenCalledWith('foo');
                });
            });
        });
    });

    describe('when payment is submitting', () => {
        let applyGiftCertificate: (code: string) => Promise<CheckoutSelectors>;
        let applyCoupon: (code: string) => Promise<CheckoutSelectors>;
        
        beforeEach(() => {
            applyGiftCertificate = jest.fn();
            applyCoupon = jest.fn();
            
            checkoutState = checkoutService.getState();

            jest.spyOn(checkoutState.statuses, 'isSubmittingOrder').mockReturnValue(true);

            component = mount(
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
        });

        it('apply button should be disabled when payment is submitting', () => {
            const submitButton = component.find('[data-test="redeemableEntry-submit"]');

            expect(submitButton.prop('disabled')).toBe(true);
            expect(submitButton.hasClass('is-loading')).toBe(false);
        });

        it('calls applyCoupon when payment is submitting', async () => {
            const submitButton = component.find('[data-test="redeemableEntry-submit"]');

            submitButton.simulate('click');
            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(applyGiftCertificate).not.toHaveBeenCalled();
        });

        it('does not call applyCoupon when enter is hit inside input', async () => {
            component
                .find('[data-test="redeemableEntry-input"]')
                .simulate('keyDown', { key: 'Enter', keyCode: 13, which: 13 });

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(applyCoupon).not.toHaveBeenCalled();
        });
    });
});
