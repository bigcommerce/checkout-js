const addApplePaySessionToChrome = () => {
    class ApplePaySessionCustomerStep {
        version: number;
        paymentRequest: ApplePayJS.ApplePayPaymentRequest;

        constructor(version, paymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }

        STATUS_SUCCESS = 1;
        STATUS_FAILURE = 2;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        supportsVersion(versionNumber) {
            return true;
        }

        canMakePayments() {
            return true;
        }

        canMakePaymentsWithActiveCard() {
            return Promise.resolve(this.canMakePayments());
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        completePayment() {
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
        completeShippingContactSelection(update) {
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
        completeShippingMethodSelection(update) {
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
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

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.onvalidatemerchant(validationEvent);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.onshippingcontactselected(shippingContactEvent);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
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
                            paymentMethod: {
                                displayName: 'xx',
                                network: 'xx',
                                type: 'debit',
                                paymentPass: {
                                    primaryAccountIdentifier: 'xx',
                                    primaryAccountNumberSuffix: 'xx',
                                    activationState: 'activated'
                                }
                            },
                            transactionIdentifier: "xx",
                        },
                        billingContact: {
                            emailAddress: "mock@mock.com",
                            familyName: "mock",
                            givenName: "mock",
                            phoneNumber: "00000000",
                        },
                        shippingContact: {
                            emailAddress: "mock@mock.com",
                            familyName: "mock",
                            givenName: "mock",
                            phoneNumber: "00000000",
                        }
                    },
                    bubbles: false,
                    cancelBubble: false,
                    cancelable: false,
                    composed: false,
                    currentTarget: {
                        addEventListener: () => { return null; },
                        dispatchEvent: () => { return true },
                        removeEventListener: () => { return null; },
                    },
                    defaultPrevented: false,
                    eventPhase: 1,
                    isTrusted: false,
                    returnValue: false,
                    srcElement: {
                        addEventListener: () => { return null; },
                        dispatchEvent: () => { return true },
                        removeEventListener: () => { return null; },
                    },
                    target: {
                        addEventListener: () => { return null; },
                        dispatchEvent: () => { return true },
                        removeEventListener: () => { return null; },
                    },
                    timeStamp: '',
                    type: '',
                    composedPath: () => { return [] },
                    initEvent: () => { return null; },
                    preventDefault: () => { return null; },
                    stopImmediatePropagation: () => { return null; },
                    stopPropagation: () => { return null; },
                    AT_TARGET: 0,
                    BLUR: 0,
                    BUBBLING_PHASE: 0,
                    CAPTURING_PHASE: 0,
                    CHANGE: 0,
                    CLICK: 0,
                    DBLCLICK: 0,
                    DRAGDROP: 0,
                    FOCUS: 0,
                    KEYDOWN: 0,
                    KEYPRESS: 0,
                    KEYUP: 0,
                    MOUSEDOWN: 0,
                    MOUSEDRAG: 0,
                    MOUSEMOVE: 0,
                    MOUSEOUT: 0,
                    MOUSEOVER: 0,
                    MOUSEUP: 0,
                    NONE: 0,
                    SELECT: 0,
                } as ApplePayJS.ApplePayPaymentAuthorizedEvent;

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.onpaymentauthorized(event, this);
            }, 1000)
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ApplePaySession = ApplePaySessionCustomerStep;
}

export default addApplePaySessionToChrome
