class ApplePaySession {
    constructor(version, paymentRequest) {
        this.version = version;
        this.paymentRequest = paymentRequest;
    }

    static STATUS_SUCCESS = 1;
    static STATUS_FAILURE = 2;

    onshippingcontactselected(
        event
    ) {
        const mockShippingContact = {
            emailAddress: 'example@bigcommerce.com',
            familyName: 'ple',
            givenName: "exam",
            phoneNumber: "00000000",
            addressLine: ["123 Example Road"],
            locality: "Sydney",
            country: "United States"
        }
        return { mockShippingContact };
    }

    onshippingmethodselected(
        event
    ) {
        const mockShippingMethod = {
            label: 'example label',
            detail: 'example detail',
            amount: '100',
            identifier: 'example'
        }
        return { mockShippingMethod };
    }

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

const addApplePaySessionToChrome = () => {
    window.ApplePaySession = ApplePaySession;
}

addApplePaySessionToChrome();
