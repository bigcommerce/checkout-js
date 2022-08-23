import ApplePaySessionMockObject from "./AppleSessionMockObject";

const addApplePaySessionToChrome = () => {
    class ApplePaySessionCustomerStep extends ApplePaySessionMockObject {
        [x: string]: any;
        begin() {
            setTimeout(() => {
                console.log('testing')
                const validationEvent = {
                    validationURL: 'https://www.example.com',
                } as ApplePayJS.ApplePayValidateMerchantEvent

                const shippingContactEvent = {
                    shippingContact: {
                        email: "xx@xx.com",
                        familyName: 'xx',
                        givenName: 'xx'
                    }
                } as unknown as ApplePayJS.ApplePayShippingContactSelectedEvent;

                const shippingMethodSelectedEvent = {
                    shippingMethod: {
                        label: 'xx',
                        detail: 'xx',
                        amount: "xx",
                        identifier: 'xx'
                    }
                } as ApplePayJS.ApplePayShippingMethodSelectedEvent

                this.onvalidatemerchant(validationEvent);
                this.onshippingcontactselected(shippingContactEvent);
                this.onshippingmethodselected(shippingMethodSelectedEvent);
            }, 0);
            setTimeout(() => {
                const mockPaymentData = {
                    version: "mock_v1",
                    data: "mockData",
                    signature: "mockSignature",
                    header: {
                        ephemeralPublicKey: "mockPublicKey",
                        publicKeyHash: "mockPublicKeyHash",
                        transactionId: "mockTransactionId",
                    }
                }
                const event = {
                    payment: {
                        token: {
                            paymentData: mockPaymentData,
                            paymentMethod: "xx",
                            transactionIdentifier: "xx",
                        },
                        billingContact: {
                            emailAddress: "mock@mock.com",
                            familyName: "mock",
                            givenName: "mock",
                            phoneNumber: "00000000",
                        },
                        payment: {
                            shippingContact: {
                                emailAddress: "mock@mock.com",
                                familyName: "mock",
                                givenName: "mock",
                                phoneNumber: "00000000",
                            }
                        },
                    }
                } as unknown as ApplePayJS.ApplePayPaymentAuthorizedEvent;

                this.onpaymentauthorized(event, this);
            }, 1000)
        }
    }

    // @ts-ignore
    window.ApplePaySession = ApplePaySessionCustomerStep;
}

export default addApplePaySessionToChrome
