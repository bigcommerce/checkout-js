/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
const addApplePaySessionToChrome = () => {
    class ApplePaySessionCustomerStep {
        [x: string]: any;
        version: number;
        paymentRequest: ApplePayJS.ApplePayPaymentRequest;

        constructor(version, paymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }

        static STATUS_SUCCESS = 1;
        static STATUS_FAILURE = 2;

        static supportsVersion(versionNumber) {
            return true;
        }

        static canMakePayments() {
            return true;
        }

        static canMakePaymentsWithActiveCard() {
            return Promise.resolve(this.canMakePayments());
        }

        completePayment() {
        }

        completeShippingContactSelection(update) {
        }

        completeShippingMethodSelection(update) {
        }

        completeMerchantValidation(response) {
        }
        begin() {
            setTimeout(() => {
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
