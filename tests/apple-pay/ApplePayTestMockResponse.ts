export const payments = `[{
    "id": "braintree",
    "gateway": null,
    "logoUrl": "https:\/\/shariceapplauded-cloud-dev-vm.store.bcdev\/rHEAD\/modules\/checkout\/braintree\/images\/paypal_powered_braintree_horizontal.png",
    "method": "credit-card",
    "supportedCards": ["PAYPAL", "VENMO", "PAYPALCREDIT", "VISA", "MC", "AMEX", "DISCOVER", "APPLEPAY", "GOOGLEPAY"],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Credit Card",
        "cardCode": true,
        "helpText": "",
        "enablePaypal": true,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": true,
        "isVisaCheckoutEnabled": false,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": false,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": true,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "isBraintreeVenmoEnabled": 0
    },
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "braintreepaypal",
    "gateway": null,
    "logoUrl": "",
    "method": "paypal",
    "supportedCards": ["VISA", "MC", "DISCOVER", "AMEX"],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Braintree (PayPal)",
        "cardCode": true,
        "helpText": "",
        "enablePaypal": true,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": true,
        "isVisaCheckoutEnabled": false,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": false,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": true,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "isBraintreeVenmoEnabled": 0
    },
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "braintreepaypalcredit",
    "gateway": null,
    "logoUrl": "",
    "method": "paypal-credit",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Braintree (PayPal Credit)",
        "cardCode": true,
        "helpText": "",
        "enablePaypal": true,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": true,
        "isVisaCheckoutEnabled": false,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": false,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": true,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "isBraintreeVenmoEnabled": 0,
        "payPalCreditProductBrandName": "Pay Later"
    },
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "applepay",
    "gateway": null,
    "logoUrl": "https:\/\/shariceapplauded-cloud-dev-vm.store.bcdev\/rHEAD\/modules\/checkout\/applepay\/images\/applepay-header@2x.png",
    "method": "applepay",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "",
        "cardCode": null,
        "helpText": "",
        "enablePaypal": null,
        "merchantId": "75bfaa7d-fc1d-519a-a447-ab2f8095eade",
        "is3dsEnabled": null,
        "testMode": false,
        "isVisaCheckoutEnabled": null,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": null,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": false,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "storeName": "My Dev Store 758323881",
        "countryCode": "US",
        "currencyCode": "USD",
        "supportedNetworks": ["visa", "masterCard", "amex", "discover"],
        "gateway": "braintree",
        "merchantCapabilities": ["supports3DS"],
        "merchantId": "75bfaa7d-fc1d-519a-a447-ab2f8095eade",
        "paymentsUrl": "https:\/\/bigpay.service.bcdev",
        "sentry": "https:\/\/e9baf8b77dd74141a0e9eaebb9dd3706@sentry.io\/1188037",
        "confirmationLink": "\/checkout\/order-confirmation"
    },
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "googlepaybraintree",
    "gateway": null,
    "logoUrl": "",
    "method": "googlepay",
    "supportedCards": ["VISA", "AMEX", "MC"],
    "providesShippingAddress": true,
    "config": {
        "displayName": "Google Pay",
        "cardCode": null,
        "helpText": "",
        "enablePaypal": null,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": true,
        "isVisaCheckoutEnabled": null,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": null,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": true,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "gateway": "braintree",
        "platformToken": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudE9yaWdpbiI6Im15LWRldi1zdG9yZS03NTgzMjM4ODEuc3RvcmUuYmNkZXYiLCJtZXJjaGFudElkIjoiMTU1NDAxNjgwNTE3MzY4MTcyMTAiLCJpYXQiOjE2NTg3MjA4MDN9.03Ub7lCBRF26D89HUMjwKTa1n4ibHRvAdHa0Mm7njhIvkhg0b2dMTuGNvcl9rU9HGJsAA8ejLBfTtFrDIsy5Mw",
        "googleMerchantId": "15540168051736817210",
        "googleMerchantName": "BigCommerce",
        "isThreeDSecureEnabled": false
    },
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "bigpaypay",
    "gateway": null,
    "logoUrl": "",
    "method": "zzzblackhole",
    "supportedCards": ["VISA", "AMEX", "MC"],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Test Payment Provider",
        "cardCode": null,
        "helpText": "",
        "enablePaypal": null,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": false,
        "isVisaCheckoutEnabled": null,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": null,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": true,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": null,
    "clientToken": null,
    "returnUrl": null
}, {
    "id": "cod",
    "gateway": null,
    "logoUrl": "",
    "method": "offline",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Cash on Delivery",
        "cardCode": null,
        "helpText": "Type your cash on delivery instructions in here.",
        "enablePaypal": null,
        "merchantId": null,
        "is3dsEnabled": null,
        "testMode": false,
        "isVisaCheckoutEnabled": null,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": null,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": false,
        "logo": null
    },
    "type": "PAYMENT_TYPE_OFFLINE",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": null,
    "clientToken": null,
    "returnUrl": null
}]`;

export const applepay = `{
    "id": "applepay",
    "gateway": null,
    "logoUrl": "https://shariceapplauded-cloud-dev-vm.store.bcdev/rHEAD/modules/checkout/applepay/images/applepay-header@2x.png",
    "method": "applepay",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "",
        "cardCode": null,
        "helpText": "",
        "enablePaypal": null,
        "merchantId": "75bfaa7d-fc1d-519a-a447-ab2f8095eade",
        "is3dsEnabled": null,
        "testMode": false,
        "isVisaCheckoutEnabled": null,
        "requireCustomerCode": false,
        "isVaultingEnabled": false,
        "isVaultingCvvEnabled": null,
        "hasDefaultStoredInstrument": false,
        "isHostedFormEnabled": false,
        "logo": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": {
        "storeName": "My Dev Store 758323881",
        "countryCode": "US",
        "currencyCode": "USD",
        "supportedNetworks": [
            "visa",
            "masterCard",
            "amex",
            "discover"
        ],
        "gateway": "braintree",
        "merchantCapabilities": [
            "supports3DS"
        ],
        "merchantId": "75bfaa7d-fc1d-519a-a447-ab2f8095eade",
        "paymentsUrl": "https://bigpay.service.bcdev",
        "sentry": "https://e9baf8b77dd74141a0e9eaebb9dd3706@sentry.io/1188037",
        "confirmationLink": "/checkout/order-confirmation"
    },
    "clientToken": null,
    "returnUrl": null
}`;

export const validateMerchantResponse = `{
    "epochTimestamp": 1658721037897,
    "expiresAt": 1658724637897,
    "merchantSessionIdentifier": "SSHAB16C076C12E4978B226E01D09ADE93A_916523AAED1343F5BC5815E12BEE9250AFFDC1A17C46B0DE5A943F0F94927C24",
    "nonce": "6c55fd3b",
    "merchantIdentifier": "04A3AD734AB1F4C2774381DF86F856FCD41AABEC3218922BA0B29B508F74E910",
    "domainName": "my-dev-store-758323881.store.bcdev",
    "displayName": "My Dev Store 758323881",
    "signature": "308006092a864886f70d010702a0803080020101310d300b0609608648016503040201308006092a864886f70d0107010000a080308203e330820388a00302010202084c304149519d5436300a06082a8648ce3d040302307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b3009060355040613025553301e170d3139303531383031333235375a170d3234303531363031333235375a305f3125302306035504030c1c6563632d736d702d62726f6b65722d7369676e5f5543342d50524f4431143012060355040b0c0b694f532053797374656d7331133011060355040a0c0a4170706c6520496e632e310b30090603550406130255533059301306072a8648ce3d020106082a8648ce3d03010703420004c21577edebd6c7b2218f68dd7090a1218dc7b0bd6f2c283d846095d94af4a5411b83420ed811f3407e83331f1c54c3f7eb3220d6bad5d4eff49289893e7c0f13a38202113082020d300c0603551d130101ff04023000301f0603551d2304183016801423f249c44f93e4ef27e6c4f6286c3fa2bbfd2e4b304506082b0601050507010104393037303506082b060105050730018629687474703a2f2f6f6373702e6170706c652e636f6d2f6f63737030342d6170706c65616963613330323082011d0603551d2004820114308201103082010c06092a864886f7636405013081fe3081c306082b060105050702023081b60c81b352656c69616e6365206f6e207468697320636572746966696361746520627920616e7920706172747920617373756d657320616363657074616e6365206f6620746865207468656e206170706c696361626c65207374616e64617264207465726d7320616e6420636f6e646974696f6e73206f66207573652c20636572746966696361746520706f6c69637920616e642063657274696669636174696f6e2070726163746963652073746174656d656e74732e303606082b06010505070201162a687474703a2f2f7777772e6170706c652e636f6d2f6365727469666963617465617574686f726974792f30340603551d1f042d302b3029a027a0258623687474703a2f2f63726c2e6170706c652e636f6d2f6170706c6561696361332e63726c301d0603551d0e041604149457db6fd57481868989762f7e578507e79b5824300e0603551d0f0101ff040403020780300f06092a864886f76364061d04020500300a06082a8648ce3d0403020349003046022100be09571fe71e1e735b55e5afacb4c72feb445f30185222c7251002b61ebd6f55022100d18b350a5dd6dd6eb1746035b11eb2ce87cfa3e6af6cbd8380890dc82cddaa63308202ee30820275a0030201020208496d2fbf3a98da97300a06082a8648ce3d0403023067311b301906035504030c124170706c6520526f6f74204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b3009060355040613025553301e170d3134303530363233343633305a170d3239303530363233343633305a307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b30090603550406130255533059301306072a8648ce3d020106082a8648ce3d03010703420004f017118419d76485d51a5e25810776e880a2efde7bae4de08dfc4b93e13356d5665b35ae22d097760d224e7bba08fd7617ce88cb76bb6670bec8e82984ff5445a381f73081f4304606082b06010505070101043a3038303606082b06010505073001862a687474703a2f2f6f6373702e6170706c652e636f6d2f6f63737030342d6170706c65726f6f7463616733301d0603551d0e0416041423f249c44f93e4ef27e6c4f6286c3fa2bbfd2e4b300f0603551d130101ff040530030101ff301f0603551d23041830168014bbb0dea15833889aa48a99debebdebafdacb24ab30370603551d1f0430302e302ca02aa0288626687474703a2f2f63726c2e6170706c652e636f6d2f6170706c65726f6f74636167332e63726c300e0603551d0f0101ff0404030201063010060a2a864886f7636406020e04020500300a06082a8648ce3d040302036700306402303acf7283511699b186fb35c356ca62bff417edd90f754da28ebef19c815e42b789f898f79b599f98d5410d8f9de9c2fe0230322dd54421b0a305776c5df3383b9067fd177c2c216d964fc6726982126f54f87a7d1b99cb9b0989216106990f09921d00003182018830820184020101308186307a312e302c06035504030c254170706c65204170706c69636174696f6e20496e746567726174696f6e204341202d20473331263024060355040b0c1d4170706c652043657274696669636174696f6e20417574686f7269747931133011060355040a0c0a4170706c6520496e632e310b300906035504061302555302084c304149519d5436300b0609608648016503040201a08193301806092a864886f70d010903310b06092a864886f70d010701301c06092a864886f70d010905310f170d3232303732353033353033375a302806092a864886f70d010934311b3019300b0609608648016503040201a10a06082a8648ce3d040302302f06092a864886f70d01090431220420b6dcd3b9a3190c29dfb797fc9c12a068f94c32cf09d58b426ad2cbb5395ed0c2300a06082a8648ce3d04030204473045022100bb00e55eeda791ba18aa6d6a1843b77fef3b42cfa90a566778dba6c188dd58600220773dd583002bddf6a032ddb1bffc764f9b801f4e9f8646471ce4e8cb3b1ec013000000000000",
    "operationalAnalyticsIdentifier": "My Dev Store 758323881:04A3AD734AB1F4C2774381DF86F856FCD41AABEC3218922BA0B29B508F74E910",
    "retries": 0,
    "pspId": "3CB4B3902E4B10CF84F2E7B43C0774B9D9C75299C61590262B4163389E2F201B"
}`;

export const order = `{
    "orderId": 124,
    "cartId": "5613fa38-bf06-4e3c-aca8-c723851f8d15",
    "currency": {
        "name": "US Dollar",
        "code": "USD",
        "symbol": "$",
        "decimalPlaces": 2
    },
    "isTaxIncluded": false,
    "baseAmount": 200,
    "discountAmount": 0,
    "orderAmount": 200,
    "orderAmountAsInteger": 20000,
    "shippingCostTotal": 0,
    "shippingCostBeforeDiscount": 0,
    "handlingCostTotal": 0,
    "giftWrappingCostTotal": 0,
    "coupons": [],
    "lineItems": {
        "physicalItems": [
            {
                "id": 26,
                "productId": 103,
                "name": "[Sample] Canvas Laundry Cart",
                "url": "https://my-dev-store-758323881.store.bcdev/canvas-laundry-cart/",
                "sku": "CLC",
                "quantity": 1,
                "isTaxable": true,
                "giftWrapping": null,
                "imageUrl": "https://shariceapplauded-cloud-dev-vm.store.bcdev/store/4j2kt0jl0q/products/103/images/334/naturalcanvascart2.1657528585.190.285.jpg?c=1",
                "discounts": [],
                "discountAmount": 0,
                "listPrice": 200,
                "salePrice": 200,
                "extendedListPrice": 200,
                "extendedSalePrice": 200,
                "extendedComparisonPrice": 200,
                "categories": [],
                "type": "physical",
                "variantId": 71,
                "socialMedia": [
                    {
                        "channel": "Facebook",
                        "code": "fb",
                        "text": "I just bought '[Sample] Canvas Laundry Cart' on My Dev Store 758323881",
                        "link": "http://www.facebook.com/sharer/sharer.php?p%5Burl%5D=https%3A%2F%2Fmy-dev-store-758323881.store.bcdev%2Fcanvas-laundry-cart%2F"
                    },
                    {
                        "channel": "Twitter",
                        "code": "tw",
                        "text": "I just bought '[Sample] Canvas Laundry Cart' on My Dev Store 758323881",
                        "link": "https://twitter.com/intent/tweet?url=https%3A%2F%2Fmy-dev-store-758323881.store.bcdev%2Fcanvas-laundry-cart%2F&text=I+just+bought+%27%5BSample%5D+Canvas+Laundry+Cart%27+on+My+Dev+Store+758323881"
                    }
                ],
                "options": []
            }
        ],
        "digitalItems": [],
        "giftCertificates": []
    },
    "customerId": 19,
    "billingAddress": {
        "firstName": "test",
        "lastName": "test",
        "email": "test@test.com",
        "company": "",
        "address1": "10 test st",
        "address2": "",
        "city": "Sydney",
        "stateOrProvince": "New South Wales",
        "stateOrProvinceCode": "NSW",
        "country": "Australia",
        "countryCode": "AU",
        "postalCode": "2000",
        "phone": "",
        "customFields": []
    },
    "status": "INCOMPLETE",
    "customerCanBeCreated": true,
    "hasDigitalItems": false,
    "isDownloadable": false,
    "isComplete": false,
    "customerMessage": "",
    "taxes": [
        {
            "name": "Tax",
            "amount": 0
        }
    ],
    "taxTotal": 0,
    "channelId": 1,
    "consignments": {
        "shipping": [
            {
                "lineItems": [
                    {
                        "id": 26
                    }
                ],
                "shippingAddressId": 26,
                "firstName": "test",
                "lastName": "test",
                "company": "",
                "address1": "10 test st",
                "address2": "",
                "city": "Sydney",
                "stateOrProvince": "New South Wales",
                "postalCode": "2000",
                "country": "Australia",
                "countryCode": "AU",
                "email": "test@test.com",
                "phone": "",
                "itemsTotal": 1,
                "itemsShipped": 0,
                "shippingMethod": "Free Shipping",
                "baseCost": 0,
                "costExTax": 0,
                "costIncTax": 0,
                "costTax": 0,
                "costTaxClassId": 2,
                "baseHandlingCost": 0,
                "handlingCostExTax": 0,
                "handlingCostIncTax": 0,
                "handlingCostTax": 0,
                "handlingCostTaxClassId": 2,
                "shippingZoneId": 2,
                "shippingZoneName": "Rest of the World",
                "customFields": []
            }
        ]
    },
    "payments": []
}`;


export const orderPayment = '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"errors":[]}';

export const internalOrder = '{"data":{"order":{"orderId":124,"token":"*","payment":{"id":"","gateway":null,"status":"PAYMENT_STATUS_INITIALIZE","helpText":null},"socialData":{"86":{"fb":{"name":"[Sample] Able Brewing System","description":"Stemming from an intense passion for the most flavourful cup of coffee, Able Brewing set out to create a brewer that was as aesthetically pleasing as it was functional. They imagined a product that...","image":"https:\\/\\/corypractised-cloud-dev-vm.store.bcdev\\/store\\/m1krj3d4yv\\/products\\/86\\/images\\/286\\/ablebrewingsystem4.1647253530.190.285.jpg?c=1","url":"https:\\/\\/my-dev-store-745516528.store.bcdev\\/able-brewing-system\\/","shareText":"I just bought [Sample] Able Brewing System on My Dev Store 745516528","sharingLink":"http:\\/\\/www.facebook.com\\/sharer\\/sharer.php?p%5Burl%5D=https%3A%2F%2Fmy-dev-store-745516528.store.bcdev%2Fable-brewing-system%2F","channelName":"Facebook","channelCode":"fb"},"tw":{"name":"[Sample] Able Brewing System","description":"Stemming from an intense passion for the most flavourful cup of coffee, Able Brewing set out to create a brewer that was as aesthetically pleasing as it was functional. They imagined a product that...","image":"https:\\/\\/corypractised-cloud-dev-vm.store.bcdev\\/store\\/m1krj3d4yv\\/products\\/86\\/images\\/286\\/ablebrewingsystem4.1647253530.190.285.jpg?c=1","url":"https:\\/\\/my-dev-store-745516528.store.bcdev\\/able-brewing-system\\/","shareText":"I just bought [Sample] Able Brewing System on My Dev Store 745516528","sharingLink":"https:\\/\\/twitter.com\\/intent\\/tweet?url=https%3A%2F%2Fmy-dev-store-745516528.store.bcdev%2Fable-brewing-system%2F&text=I+just+bought+%27%5BSample%5D+Able+Brewing+System%27+on+My+Dev+Store+745516528","channelName":"Twitter","channelCode":"tw"}}},"status":"ORDER_STATUS_INCOMPLETE","customerCreated":false,"hasDigitalItems":false,"isDownloadable":false,"isComplete":false,"callbackUrl":"https:\\/\\/internalapi-10000455.store.bcdev\\/internalapi\\/v1\\/checkout\\/order\\/390\\/payment","customerCanBeCreated":true,"id":390,"items":[{"id":86,"type":"ItemPhysicalEntity","name":"[Sample] Able Brewing System","imageUrl":"https:\\/\\/corypractised-cloud-dev-vm.store.bcdev\\/store\\/m1krj3d4yv\\/products\\/86\\/images\\/286\\/ablebrewingsystem4.1647253530.190.285.jpg?c=1","quantity":1,"amount":225,"discount":0,"amountAfterDiscount":225,"tax":0,"attributes":[],"integerAmount":22500,"integerDiscount":0,"integerAmountAfterDiscount":22500,"integerTax":0}],"currency":"USD","subtotal":{"amount":225,"integerAmount":22500},"coupon":{"discountedAmount":0,"coupons":[]},"discount":{"amount":0,"integerAmount":0},"discountNotifications":[],"giftCertificate":{"totalDiscountedAmount":0,"appliedGiftCertificates":[]},"shipping":{"amount":0,"integerAmount":0,"amountBeforeDiscount":0,"integerAmountBeforeDiscount":0,"required":true},"storeCredit":{"amount":0},"taxSubtotal":{"amount":0,"integerAmount":0},"taxes":[{"name":"Tax","amount":0}],"taxTotal":{"amount":0,"integerAmount":0},"handling":{"amount":0,"integerAmount":0},"grandTotal":{"amount":225,"integerAmount":22500}}},"meta":{"deviceFingerprint":null}}';
