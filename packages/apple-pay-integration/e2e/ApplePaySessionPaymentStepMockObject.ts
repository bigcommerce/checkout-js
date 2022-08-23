const addApplePaySessionToChrome = () => {
    class ApplePaySessionPaymentStep {
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
                const event = {
                    validationURL: 'https://www.example.com',
                } as ApplePayJS.ApplePayValidateMerchantEvent
                this.onvalidatemerchant(event);
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
                const event: ApplePayJS.ApplePayPaymentAuthorizedEvent = {
                    payment: {
                        token: {
                            paymentData: mockPaymentData,
                            paymentMethod: {
                                displayName: "xx",
                                network: "xx",
                                type: "debit",
                                paymentPass: {
                                    primaryAccountIdentifier: "xx",
                                    primaryAccountNumberSuffix: "xx",
                                    activationState: "activated"
                                }
                            },
                            transactionIdentifier: "xx",
                        }
                    },
                } as unknown as ApplePayJS.ApplePayPaymentAuthorizedEvent;

                //@ts-ignore
                this.onpaymentauthorized(event, this);
            }, 1000)
        }
    }

    // @ts-ignore
    window.ApplePaySession = ApplePaySessionPaymentStep;
}

export default addApplePaySessionToChrome;