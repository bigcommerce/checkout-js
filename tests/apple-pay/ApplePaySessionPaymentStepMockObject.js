class ApplePaySession {
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
        const event = {
            payment: {
                token: {
                    paymentData: mockPaymentData,
                    paymentMethod: "xx",
                    transactionIdentifier: "xx",
                }
            }
        };

        this.onpaymentauthorized(event, this);
    }

    begin() {
        setTimeout(() => {
            const event = {
                validationURL: 'https://www.example.com',
            }
            this.onvalidatemerchant(event);
        }, 0);
    }
}

const addApplePaySessionToChrome = () => {
    window.ApplePaySession = ApplePaySession;
}

addApplePaySessionToChrome();
