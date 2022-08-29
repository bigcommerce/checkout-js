const addApplePaySessionToChrome = () => {
    class ApplePaySessionCustomerStep implements ApplePaySession {
        version: number;
        paymentRequest: ApplePayJS.ApplePayPaymentRequest;

        static STATUS_SUCCESS = 1;
        static STATUS_FAILURE = 2;

        static supportsVersion(_versionNumber: unknown) {
            console.log('supportsVersion', _versionNumber)
            return true;
        }

        constructor(version, paymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }

        addEventListener(_type: string, _callback: EventListenerOrEventListenerObject | null, _options?: boolean | AddEventListenerOptions | undefined): void {
            console.log('addEventListener', _type, _callback, _options);
        }

        dispatchEvent(_event: Event): boolean {
            console.log('dispatchEvent', _event);
            return true
        }
        
        removeEventListener(_type: string, _callback: EventListenerOrEventListenerObject | null, _options?: boolean | EventListenerOptions | undefined): void {
            console.log('removeEventListener', _type, _callback, _options);
        }

        oncancel: (event: ApplePayJS.Event) => void = () => { 
            console.log('oncancel');
        }

        onpaymentauthorized: (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => void = () => {
            console.log('onpaymentauthorized');
        }

        onpaymentmethodselected: (event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void = () => {
            console.log('onpaymentmethodselected');
        }

        onshippingcontactselected: (event: ApplePayJS.ApplePayShippingContactSelectedEvent) => void = () => { 
            console.log('onshippingcontactselected');
        }

        onshippingmethodselected: (event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void  = () => { 
            console.log('onshippingmethodselected');
        }

        onvalidatemerchant: (event: ApplePayJS.ApplePayValidateMerchantEvent) => void  = () => { 
            console.log('onvalidatemerchant');
        }

        abort(): void {
            console.log('abort')
        }        

        canMakePayments() {
            return true;
        }

        canMakePaymentsWithActiveCard() {
            return Promise.resolve(this.canMakePayments());
        }

        completePayment() {
            console.log('completePayment');
        }

        completeShippingContactSelection(_update: unknown) {
            console.log('completeShippingContactSelection', _update);
        }

        completeShippingMethodSelection(_update: unknown) {
            console.log('completeShippingMethodSelection', _update);
        }

        completeMerchantValidation(_response: unknown) {
            console.log('completeMerchantValidation', _response);
        }

        completePaymentMethodSelection(...args: [newTotal: ApplePayJS.ApplePayLineItem, newLineItems: ApplePayJS.ApplePayLineItem[]] | [update: ApplePayJS.ApplePayPaymentMethodUpdate]): void {
            console.log('completeMerchantValidation', args);
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
                } as unknown as ApplePayJS.ApplePayPaymentAuthorizedEvent;

                this.onpaymentauthorized(event);
            }, 1000)
        }
    }

    window['ApplePaySession'] = ApplePaySessionCustomerStep;
}

export default addApplePaySessionToChrome
