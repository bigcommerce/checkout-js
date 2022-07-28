const addApplePaySessionToChrome = () => {
    class ApplePaySession {
        constructor(version, paymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }

        static STATUS_SUCCESS = 1;
        static STATUS_FAILURE = 2;
        // static STATUS_INVALID_BILLING_POSTAL_ADDRESS = 3;
        // static STATUS_INVALID_SHOPPING_CONTACT = 4;
        // static STATUS_INVALID_SHOPPING_POSTAL_ADDRESS = 5;
        // static STATUS_PIN_INCORRECT = 6;
        // static STATUS_PIN_LOCKOUT = 7;
        // static STATUS_PIN_REQUIRED = 8;

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
            console.log('ApplePaySession.completePayment()');
        }

        completeMerchantValidation(response) {
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
            // TODO: better token mockup
            const event = {
                payment: {
                    token: {
                       paymentData: mockPaymentData,
                       paymentMethod: "xx",
                       transactionIdentifier: "xx",
                    }
                }
            };

            this.onpaymentauthorized(event, this); // defined in checkout-sdk
        }

        begin() {
            setTimeout(() => {
                const event = {
                    validationURL: 'https://www.example.com',
                }
                this.onvalidatemerchant(event); // defined in checkout-sdk
            },0);
        }
    }

    window.ApplePaySession = ApplePaySession;
}

addApplePaySessionToChrome();
