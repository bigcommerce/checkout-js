import { type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { renderHook } from '@testing-library/react';

import { getPaymentMethod } from '../payment-methods.mock';

import getUniquePaymentMethodId from './getUniquePaymentMethodId';
import useFallbackWhenMethodRemoved from './useFallbackWhenMethodRemoved';

describe('useFallbackWhenMethodRemoved', () => {
    const removedMethod: PaymentMethod = getPaymentMethod();
    const fallbackMethod: PaymentMethod = { ...getPaymentMethod(), id: 'braintree' };
    const removedMethodId = getUniquePaymentMethodId(removedMethod.id, removedMethod.gateway);
    const fallbackMethodId = getUniquePaymentMethodId(fallbackMethod.id, fallbackMethod.gateway);

    const renderFallbackHook = (methods: PaymentMethod[]) => {
        const onFallback = jest.fn();
        const { rerender } = renderHook(
            (props: { methods: PaymentMethod[] }) =>
                useFallbackWhenMethodRemoved(
                    props.methods,
                    removedMethodId,
                    fallbackMethodId,
                    onFallback,
                ),
            { initialProps: { methods } },
        );

        return { onFallback, rerender };
    };

    it('falls back when the current method was removed from the list', () => {
        const { onFallback } = renderFallbackHook([fallbackMethod]);

        expect(onFallback).toHaveBeenCalledTimes(1);
        expect(onFallback).toHaveBeenCalledWith(fallbackMethodId);
    });

    it('does not fall back when the current method is still in the list', () => {
        const { onFallback } = renderFallbackHook([removedMethod, fallbackMethod]);

        expect(onFallback).not.toHaveBeenCalled();
    });

    it('does not fall back again when the list is rebuilt with the same method ids', () => {
        const { onFallback, rerender } = renderFallbackHook([fallbackMethod]);

        rerender({ methods: [{ ...fallbackMethod }] });

        expect(onFallback).toHaveBeenCalledTimes(1);
    });
});
