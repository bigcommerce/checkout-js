const addApplePaySessionToChrome = () => {
    class ApplePaySessionPaymentStep implements ApplePaySession {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        static STATUS_FAILURE = 2;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        static STATUS_SUCCESS = 1;
        version: number;
        paymentRequest: ApplePayJS.ApplePayPaymentRequest;

        static supportsVersion(versionNumber: number) {
            console.log('supportsVersion', versionNumber);

            return true;
        }

        static canMakePayments() {
            return true;
        }

        static canMakePaymentsWithActiveCard() {
            return Promise.resolve(this.canMakePayments());
        }

        // eslint-disable-next-line @typescript-eslint/member-ordering
        constructor(version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }

        addEventListener(
            type: string,
            callback: EventListenerOrEventListenerObject | null,
            options?: boolean | AddEventListenerOptions | undefined,
        ): void {
            console.log('addEventListener', type, callback, options);
        }

        dispatchEvent(event: Event): boolean {
            console.log('dispatchEvent', event);

            return true;
        }

        removeEventListener(
            type: string,
            callback: EventListenerOrEventListenerObject | null,
            options?: boolean | EventListenerOptions | undefined,
        ): void {
            console.log('removeEventListener', type, callback, options);
        }

        oncancel: (event: ApplePayJS.Event) => void = () => {
            console.log('oncancel');
        };

        onpaymentauthorized: (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => void = () => {
            console.log('onpaymentauthorized');
        };

        onpaymentmethodselected: (event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void =
            () => {
                console.log('onpaymentmethodselected');
            };

        onshippingcontactselected: (
            event: ApplePayJS.ApplePayShippingContactSelectedEvent,
        ) => void = () => {
            console.log('onshippingcontactselected');
        };

        onshippingmethodselected: (event: ApplePayJS.ApplePayShippingMethodSelectedEvent) => void =
            () => {
                console.log('onshippingmethodselected');
            };

        onvalidatemerchant: (event: ApplePayJS.ApplePayValidateMerchantEvent) => void = () => {
            console.log('onvalidatemerchant');
        };

        abort(): void {
            console.log('abort');
        }

        completePayment() {
            console.log('completePayment');
        }

        completeShippingContactSelection(update: unknown) {
            console.log('completeShippingContactSelection', update);
        }

        completeShippingMethodSelection(update: unknown) {
            console.log('completeShippingMethodSelection', update);
        }

        completeMerchantValidation(response: unknown) {
            console.log('completeMerchantValidation', response);
        }

        completePaymentMethodSelection(
            ...args:
                | [
                      newTotal: ApplePayJS.ApplePayLineItem,
                      newLineItems: ApplePayJS.ApplePayLineItem[],
                  ]
                | [update: ApplePayJS.ApplePayPaymentMethodUpdate]
        ): void {
            console.log('completeMerchantValidation', args);
        }

        begin() {
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                const event = {
                    validationURL: 'https://www.example.com',
                } as ApplePayJS.ApplePayValidateMerchantEvent;

                this.onvalidatemerchant(event);
            }, 0);
            setTimeout(() => {
                const mockPaymentData = {
                    version: 'mock_v1',
                    data: 'mockData',
                    signature: 'mockSignature',
                    header: {
                        ephemeralPublicKey: 'mockPublicKey',
                        publicKeyHash: 'mockPublicKeyHash',
                        transactionId: 'mockTransactionId',
                    },
                };
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
                                    activationState: 'activated',
                                },
                            },
                            transactionIdentifier: 'xx',
                        },
                        billingContact: {
                            emailAddress: 'mock@mock.com',
                            familyName: 'mock',
                            givenName: 'mock',
                            phoneNumber: '00000000',
                        },
                        shippingContact: {
                            emailAddress: 'mock@mock.com',
                            familyName: 'mock',
                            givenName: 'mock',
                            phoneNumber: '00000000',
                        },
                    },
                } as unknown as ApplePayJS.ApplePayPaymentAuthorizedEvent;

                this.onpaymentauthorized(event);
            }, 1000);
        }
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    window.ApplePaySession = ApplePaySessionPaymentStep as unknown as ApplePaySession;
};

export default addApplePaySessionToChrome;
