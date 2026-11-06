import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';

import { requestSurcharge } from './requestSurcharge';
import { SurchargeCalculatingRow } from './SurchargeCalculatingRow';
import { SurchargeStatus, SurchargeSubmitHint } from './SurchargeNotices';
import { useSurchargeState, useSurchargeTrigger } from './surchargeState';

jest.mock('./requestSurcharge', () => ({ requestSurcharge: jest.fn() }));

jest.mock('../../currency', () => ({
    ShopperCurrency: ({ amount }: { amount: number }) => <span>{`$${amount.toFixed(2)}`}</span>,
}));

jest.mock('@bigcommerce/checkout/locale', () => ({
    ...jest.requireActual('@bigcommerce/checkout/locale'),
    TranslatedString: ({ id }: { id: string }) => <span>{id}</span>,
    TranslatedHtml: ({ id }: { id: string }) => <span>{id}</span>,
}));

const paymentMethod = { id: 'bluesnapdirect', gateway: null };
const requestMock = requestSurcharge as jest.Mock;

interface TriggerProps {
    pfToken?: string;
    total?: number;
}

const useBoth = ({ pfToken, total = 206 }: TriggerProps) => {
    useSurchargeTrigger({ pfToken, checkoutId: 'checkout-1', paymentMethod, total });

    return useSurchargeState();
};

describe('surcharge state (backend mocked)', () => {
    const originalEnv = process.env.NODE_ENV;
    const flush = () =>
        act(async () => {
            await Promise.resolve();
        });

    beforeEach(() => {
        requestMock.mockReset();
        process.env.NODE_ENV = 'development';
        localStorage.setItem('surchargeMock', '1');
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        localStorage.clear();
    });

    it('stays idle without a pfToken and sends nothing', () => {
        const { result } = renderHook((props: TriggerProps) => useBoth(props), {
            initialProps: {},
        });

        expect(result.current.status).toBe('idle');
        expect(requestMock).not.toHaveBeenCalled();
    });

    it('asks the backend with the checkout, the payment method and the pfToken only', async () => {
        requestMock.mockResolvedValue({
            eligible: true,
            amount: 6.18,
            rate: 3,
            currency: 'USD',
            legalText: 'We impose a surcharge of 3.0%…',
        });

        const { result, rerender } = renderHook((props: TriggerProps) => useBoth(props), {
            initialProps: {},
        });

        rerender({ pfToken: 'pf-token-1' });
        expect(result.current.status).toBe('calculating');

        await flush();

        expect(requestMock).toHaveBeenCalledTimes(1);
        expect(requestMock).toHaveBeenCalledWith({
            checkoutId: 'checkout-1',
            paymentMethod,
            pfToken: 'pf-token-1',
        });
        expect(result.current).toEqual({
            status: 'ready',
            amount: 6.18,
            rate: 3,
            currency: 'USD',
            legalText: 'We impose a surcharge of 3.0%…',
        });
    });

    it('tells the caller once the backend has answered, so the checkout can be reloaded', async () => {
        requestMock.mockResolvedValue({ eligible: true, amount: 6.18 });

        const onResolved = jest.fn();

        renderHook(() =>
            useSurchargeTrigger({
                pfToken: 'pf-token-1',
                checkoutId: 'checkout-1',
                paymentMethod,
                total: 206,
                onResolved,
            }),
        );

        expect(onResolved).not.toHaveBeenCalled();

        await flush();

        expect(onResolved).toHaveBeenCalledTimes(1);
    });

    it('is "none" when the card is not eligible', async () => {
        requestMock.mockResolvedValue({ eligible: false, amount: 0 });

        const { result } = renderHook(() => useBoth({ pfToken: 'not-eligible' }));

        await flush();

        expect(result.current.status).toBe('none');
    });

    it('is "error" when the backend fails', async () => {
        requestMock.mockRejectedValue(new Error('500'));

        const { result } = renderHook(() => useBoth({ pfToken: 'error' }));

        await flush();

        expect(result.current.status).toBe('error');
    });

    it('asks again when the pfToken or the total changes, and not when nothing changed', async () => {
        requestMock.mockResolvedValue({ eligible: true, amount: 6.18 });

        const { rerender } = renderHook((props: TriggerProps) => useBoth(props), {
            initialProps: { pfToken: 'pf-token-1', total: 206 },
        });

        await flush();
        rerender({ pfToken: 'pf-token-1', total: 206 });
        expect(requestMock).toHaveBeenCalledTimes(1);

        rerender({ pfToken: 'pf-token-2', total: 206 });
        await flush();
        expect(requestMock).toHaveBeenCalledTimes(2);

        rerender({ pfToken: 'pf-token-2', total: 180 });
        await flush();
        expect(requestMock).toHaveBeenCalledTimes(3);
    });

    it('drops a late answer once the pfToken is gone', async () => {
        let resolve: (value: unknown) => void = () => undefined;

        requestMock.mockReturnValue(
            new Promise((r) => {
                resolve = r;
            }),
        );

        const initialProps: TriggerProps = { pfToken: 'pf-token-1' };
        const { result, rerender } = renderHook((props: TriggerProps) => useBoth(props), {
            initialProps,
        });

        expect(result.current.status).toBe('calculating');

        rerender({});
        resolve({ eligible: true, amount: 6.18 });
        await flush();

        expect(result.current.status).toBe('idle');
    });

    it('is inactive without the mock flag', () => {
        localStorage.clear();

        const { result } = renderHook(() => useBoth({ pfToken: 'pf-token-1' }));

        expect(result.current.status).toBe('idle');
        expect(requestMock).not.toHaveBeenCalled();
    });
});

describe('surcharge UI', () => {
    it('shows the legal text that came from the backend', () => {
        render(
            <SurchargeStatus
                surcharge={{ status: 'ready', amount: 6.18, rate: 3, legalText: 'Legal from BE' }}
            />,
        );

        expect(screen.getByTestId('surcharge-result')).toHaveTextContent('Legal from BE');
    });

    it('shows the matching notice and hint for every state', () => {
        const { rerender } = render(<SurchargeStatus surcharge={{ status: 'calculating' }} />);

        expect(screen.getByTestId('surcharge-calculating')).toBeInTheDocument();

        rerender(<SurchargeStatus surcharge={{ status: 'ready', amount: 6.18, rate: 3 }} />);
        expect(screen.getByTestId('surcharge-result')).toBeInTheDocument();

        rerender(<SurchargeStatus surcharge={{ status: 'none' }} />);
        expect(screen.getByTestId('surcharge-none')).toBeInTheDocument();

        rerender(<SurchargeStatus surcharge={{ status: 'error' }} />);
        expect(screen.getByTestId('surcharge-error')).toBeInTheDocument();

        rerender(<SurchargeSubmitHint surcharge={{ status: 'idle' }} />);
        expect(screen.getByTestId('surcharge-submit-hint')).toHaveTextContent(
            'payment.surcharge_enter_card_hint',
        );

        rerender(<SurchargeSubmitHint surcharge={{ status: 'ready', amount: 1 }} />);
        expect(screen.queryByTestId('surcharge-submit-hint')).not.toBeInTheDocument();
    });
});

describe('SurchargeCalculatingRow', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        requestMock.mockReset();
        process.env.NODE_ENV = 'development';
        localStorage.setItem('surchargeMock', '1');
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        localStorage.clear();
    });

    const Harness = ({ pfToken }: { pfToken?: string }) => {
        useSurchargeTrigger({ pfToken, checkoutId: 'checkout-1', paymentMethod, total: 206 });

        return <SurchargeCalculatingRow />;
    };

    it('shows the placeholder only while calculating', async () => {
        requestMock.mockResolvedValue({ eligible: true, amount: 6.18 });

        const { rerender } = render(<Harness />);

        expect(screen.queryByTestId('cart-surcharge-calculating')).not.toBeInTheDocument();

        rerender(<Harness pfToken="pf-token-1" />);

        expect(screen.getByTestId('cart-surcharge-calculating')).toHaveTextContent(
            'payment.surcharge_calculating_value',
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.queryByTestId('cart-surcharge-calculating')).not.toBeInTheDocument();
    });
});
