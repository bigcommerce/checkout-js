import { type RequestSender } from '@bigcommerce/request-sender';

import { requestSurcharge } from './requestSurcharge';

describe('requestSurcharge', () => {
    const paymentMethod = { id: 'bluesnapdirect', gateway: null };

    it('posts only the payment method and the pfToken to the surcharge URL', async () => {
        const post = jest.fn().mockResolvedValue({
            body: { eligible: true, amount: 6.18, rate: 3, currency: 'USD', legalText: 'Legal' },
        });

        const result = await requestSurcharge({
            checkoutId: 'abc/1',
            paymentMethod,
            pfToken: 'pf-token-1',
            requestSender: { post } as unknown as RequestSender,
        });

        expect(post).toHaveBeenCalledWith('/api/storefront/checkouts/abc%2F1/surcharge', {
            body: { paymentMethod, pfToken: 'pf-token-1' },
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        });
        expect(result).toMatchObject({ eligible: true, amount: 6.18, rate: 3, legalText: 'Legal' });
    });

    it('rejects when the answer is not a surcharge result', async () => {
        await expect(
            requestSurcharge({
                checkoutId: 'c',
                paymentMethod,
                pfToken: 'pf-token-1',
                requestSender: {
                    post: jest.fn().mockResolvedValue({ body: { nope: true } }),
                } as unknown as RequestSender,
            }),
        ).rejects.toThrow('Unexpected surcharge response');
    });

    it('rejects when the request fails', async () => {
        await expect(
            requestSurcharge({
                checkoutId: 'c',
                paymentMethod,
                pfToken: 'pf-token-1',
                requestSender: {
                    post: jest.fn().mockRejectedValue(new Error('500')),
                } as unknown as RequestSender,
            }),
        ).rejects.toThrow('500');
    });
});
