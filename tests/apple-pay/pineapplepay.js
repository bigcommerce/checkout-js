// https://github.com/haydnchapman/PineapplePaySession/blob/develop/Chrome/contentScripts.js

const main = () => {
    class ApplePaySession {
        constructor(version, paymentRequest) {
            this.version = version;
            this.paymentRequest = paymentRequest;
        }
        
        static STATUS_SUCCESS = 1;
        static STATUS_FAILURE = 2;
        static STATUS_INVALID_BILLING_POSTAL_ADDRESS = 3;
        static STATUS_INVALID_SHOPPING_CONTACT = 4;
        static STATUS_INVALID_SHOPPING_POSTAL_ADDRESS = 5;
        static STATUS_PIN_INCORRECT = 6;
        static STATUS_PIN_LOCKOUT = 7;
        static STATUS_PIN_REQUIRED = 8;
    
        static supportsVersion(versionNumber) {
            return true;
        }
    
        static canMakePayments() {
            return true;
        }

       static canMakePaymentsWithActiveCard() {
            return Promise.resolve(this.canMakePayments());
        }

        completeMerchantValidation(response){
            console.log('completeMerchantValidation', response);
            
            const mockPaymentData = {
                version: "mock_v1",
                data: "mockData",
                signature: "mockSignature",
                header: {
                    ephemeralPublicKey: "mockPublicKey",
                    publicKeyHash: "mockPublicKeyHash",
                    transactionId: "mockTransactionId"
                }
            }

            const event = {
                payment: {
                    token:{
                       paymentData: mockPaymentData
                    }
                }
            };

            this.onpaymentauthorized(event, this);
        }

        completePayment(authorizationResult){
            console.log('Payment Completed', authorizationResult);
        }

        begin() {
            let errors = [];

            if(!this.onvalidatemerchant || typeof(this.onvalidatemerchant) !== 'function')
                errors.push('onvalidatemerchant has not been implemented'); 
            
            if(!this.onpaymentauthorized || typeof(this.onpaymentauthorized)  !== 'function')
                errors.push('onpaymentauthorized has not been implemented');
            
            if(errors.length > 0){
                errors.map(error => console.log(error));
                return;
            }

            const event = {
                validationURL: "https://apple-pay-gateway-cert.apple.com/paymentservices/startSession"
            };

            this.onvalidatemerchant(event, this);
        }
    }

    window.ApplePaySession = ApplePaySession;
}

main();
