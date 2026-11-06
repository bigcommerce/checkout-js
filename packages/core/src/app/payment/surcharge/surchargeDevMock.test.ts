import { createRequestSender } from '@bigcommerce/request-sender';

import { requestSurcharge } from './requestSurcharge';
import { ensureSurchargeDevMockInstalled } from './surchargeDevMock';

// The mocked backend
describe('surcharge dev mock backend', () => {
    const originalEnv = process.env.NODE_ENV;
    const paymentMethod = { id: 'bluesnapdirect', gateway: null };
    const checkout = {
        id: 'checkout-1',
        grandTotal: 206,
        outstandingBalance: 206,
        fees: [] as unknown[],
        cart: { currency: { code: 'USD' } },
    };
    const mockConfig = () => (window as any).__surchargeMock.config;
    const fetchMock = jest.fn();

    beforeAll(() => {
        process.env.NODE_ENV = 'development';
        localStorage.setItem('surchargeMock', '1');
        ensureSurchargeDevMockInstalled();
    });

    afterAll(() => {
        process.env.NODE_ENV = originalEnv;
        localStorage.clear();
    });

    beforeEach(() => {
        mockConfig().delayMs = 0;
        mockConfig().mode = 'auto';
        mockConfig().rate = 3;
        checkout.fees = [];
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({ json: () => Promise.resolve(checkout) });
        (global as any).fetch = fetchMock;
    });

    it('answers an eligible pfToken with 3% of what is still to pay, read from the checkout', async () => {
        const result = await requestSurcharge({
            checkoutId: 'checkout-1',
            paymentMethod,
            pfToken: 'pf-token-1',
        });

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/storefront/checkout/checkout-1',
            expect.objectContaining({ credentials: 'include' }),
        );
        expect(result).toMatchObject({ eligible: true, amount: 6.18, rate: 3, currency: 'USD' });
        expect(result.legalText).toContain('3.0%');
    });

    it('does not surcharge a surcharge that is already on the checkout', async () => {
        checkout.outstandingBalance = 212.18;
        checkout.fees = [{ source: 'payment_surcharge', cost: 6.18 }];

        const result = await requestSurcharge({
            checkoutId: 'checkout-1',
            paymentMethod,
            pfToken: 'pf-token-1',
        });

        checkout.outstandingBalance = 206;

        expect(result.amount).toBe(6.18);
    });

    it('answers "not eligible" for the not-eligible pfToken and when forced', async () => {
        await expect(
            requestSurcharge({
                checkoutId: 'checkout-1',
                paymentMethod,
                pfToken: 'not-eligible',
            }),
        ).resolves.toMatchObject({ eligible: false, amount: 0 });

        mockConfig().mode = 'none';

        await expect(
            requestSurcharge({
                checkoutId: 'checkout-1',
                paymentMethod,
                pfToken: 'pf-token-1',
            }),
        ).resolves.toMatchObject({ eligible: false, amount: 0 });
    });

    it('fails for the error pfToken and when forced', async () => {
        await expect(
            requestSurcharge({ checkoutId: 'checkout-1', paymentMethod, pfToken: 'error' }),
        ).rejects.toMatchObject({ status: 500 });

        mockConfig().mode = 'error';

        await expect(
            requestSurcharge({
                checkoutId: 'checkout-1',
                paymentMethod,
                pfToken: 'pf-token-1',
            }),
        ).rejects.toMatchObject({ status: 500 });
    });

    it('refuses a request that carries anything but the payment method and a pfToken', async () => {
        const post = (body: unknown) =>
            createRequestSender().post('/api/storefront/checkouts/checkout-1/surcharge', {
                body,
            });

        await expect(
            post({ paymentMethod, pfToken: 'pf-token-1', cardNumber: '4242424242424242' }),
        ).rejects.toMatchObject({
            status: 422,
        });
        await expect(
            post({ paymentMethod, pfToken: 'pf-token-1', amount: 1 }),
        ).rejects.toMatchObject({
            status: 422,
        });
        await expect(post({ paymentMethod, pfToken: ' ' })).rejects.toMatchObject({ status: 422 });
    });
});
