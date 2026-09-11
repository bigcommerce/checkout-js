import { type Page } from '@playwright/test';

const googlePayStripeUpeConfig =
    '{"id":"googlepaystripeupe","gateway":null,"logoUrl":"","method":"googlepay","supportedCards":["VISA","AMEX","MC"],"providesShippingAddress":true,"config":{"displayName":"Google Pay","cardCode":null,"helpText":"","enablePaypal":null,"merchantId":null,"is3dsEnabled":null,"testMode":true,"isVisaCheckoutEnabled":null,"requireCustomerCode":false,"isVaultingEnabled":false,"isVaultingCvvEnabled":null,"hasDefaultStoredInstrument":false,"isHostedFormEnabled":false,"logo":null,"showCardHolderName":null},"type":"PAYMENT_TYPE_API","initializationStrategy":{"type":"not_applicable"},"nonce":null,"initializationData":{"gateway":"stripeupe","platformToken":"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudE9yaWdpbiI6Im15a29sYWRyb25vdjE3MjMxOTg0OTAtdGVzdGluZ3Rvbi5teS1pbnRlZ3JhdGlvbi56b25lIiwibWVyY2hhbnRJZCI6IjE1NTQwMTY4MDUxNzM2ODE3MjEwIiwiaWF0IjoxNzIzMjE1NzQ5fQ.GsVxYNipo71vru4dSPhsCzKr-a78bLfQfjJD1H0iADUkopLniwi-Idq5L2gPL8zMtxJ1hmBSMVXT7Tq73gHoeg","googleMerchantId":"15540168051736817210","googleMerchantName":"mykola.dronov+1723198490 testington","isThreeDSecureEnabled":false,"isShippingOptionsEnabled":true,"stripePublishableKey":"pk_test_bPqA9wSB7spHCx5B3MvPi6L0","stripeVersion":"2017-02-14","stripeConnectedAccount":"acct_1GnvZvFYHgt19eoy"},"clientToken":null,"returnUrl":null}';

export async function mockGooglePayStripeUpeConfig(page: Page): Promise<void> {
    await page.route(/\/api\/storefront\/payments\/googlepaystripeupe\?cartId=.*/, (route) => {
        void route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: googlePayStripeUpeConfig,
        });
    });
}
