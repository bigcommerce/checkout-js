export const applePayCart = `{
    "id":"applepay",
    "gateway":null,
    "logoUrl":"applepay-header@2x.png",
    "method":"applepay",
    "supportedCards":[],
    "providesShippingAddress":false,
    "config":{
        "displayName":"",
        "cardCode":null,
        "helpText":"",
        "enablePaypal":null,
        "merchantId":"00000000-0000-0000-0000-000000000000",
        "is3dsEnabled":null,
        "testMode":false,
        "isVisaCheckoutEnabled":null,
        "requireCustomerCode":false,
        "isVaultingEnabled":false,
        "isVaultingCvvEnabled":null,
        "hasDefaultStoredInstrument":false,
        "isHostedFormEnabled":false,
        "logo":null},
        "type":"PAYMENT_TYPE_API",
        "initializationStrategy":{
            "type":"not_applicable"
        },
        "nonce":null,
        "initializationData":{
            "storeName":"example store",
            "countryCode":"US",
            "currencyCode":"USD",
            "supportedNetworks":[
                "visa",
                "masterCard",
                "amex",
                "discover"
            ],
            "gateway":"authorizenet",
            "merchantCapabilities":["supports3DS"],
            "merchantId":"00000000-0000-0000-0000-000000000000",
            "paymentsUrl":"https://bigpay.service.bcdev",
            "sentry":"https://example@sentry.io/example",
            "confirmationLink":"/checkout/order-confirmation"
        },
        "clientToken":null,
        "returnUrl":null
    }`;

export const applepay = `{
    "id": "applepay",
    "gateway": null,
    "logoUrl": "example-applepay-header@2x.png",
    "method": "applepay",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "",
        "cardCode": null,
        "helpText": "",
        "enablePaypal": null,
        "merchantId": "00000000-0000-0000-0000-000000000000",
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
        "merchantId": "00000000-0000-0000-0000-000000000000",
        "paymentsUrl": "https://bigpay.service.bcdev",
        "sentry": "https://example@sentry.io/0000000",
        "confirmationLink": "/checkout/order-confirmation"
    },
    "clientToken": null,
    "returnUrl": null
}`;

export const validateMerchantResponse = `{
    "epochTimestamp": 1658721037897,
    "expiresAt": 1658724637897,
    "merchantSessionIdentifier": "*",
    "nonce": "6c55fd3b",
    "merchantIdentifier": "*",
    "domainName": "my-dev-store-758323881.store.bcdev",
    "displayName": "My Dev Store 758323881",
    "signature": "*",
    "operationalAnalyticsIdentifier": "My Dev Store",
    "retries": 0,
    "pspId": "*"
}`;

export const order = `{
    "orderId": 124,
    "cartId": "00000000-0000-0000-0000-000000000000",
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
                "imageUrl": "example.jpg",
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

export const orderPayment =
    '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"errors":[]}';

export const internalOrder = `{
    "data": {
        "order": {
            "callbackUrl": "https://internalapi-10000455.store.bcdev/internalapi/v1/checkout/order/390/payment",
            "coupon": {
                "coupons": [],
                "discountedAmount": 0
            },
            "currency": "USD",
            "customerCanBeCreated": true,
            "customerCreated": false,
            "discount": {
                "amount": 0,
                "integerAmount": 0
            },
            "discountNotifications": [],
            "giftCertificate": {
                "appliedGiftCertificates": [],
                "totalDiscountedAmount": 0
            },
            "grandTotal": {
                "amount": 225,
                "integerAmount": 22500
            },
            "handling": {
                "amount": 0,
                "integerAmount": 0
            },
            "hasDigitalItems": false,
            "id": 390,
            "isComplete": false,
            "isDownloadable": false,
            "items": [
                {
                    "amount": 225,
                    "amountAfterDiscount": 225,
                    "attributes": [],
                    "discount": 0,
                    "id": 86,
                    "imageUrl": "example.jpg",
                    "integerAmount": 22500,
                    "integerAmountAfterDiscount": 22500,
                    "integerDiscount": 0,
                    "integerTax": 0,
                    "name": "[Sample] Able Brewing System",
                    "quantity": 1,
                    "tax": 0,
                    "type": "ItemPhysicalEntity"
                }
            ],
            "orderId": 124,
            "payment": {
                "gateway": null,
                "helpText": null,
                "id": "",
                "status": "PAYMENT_STATUS_INITIALIZE"
            },
            "shipping": {
                "amount": 0,
                "amountBeforeDiscount": 0,
                "integerAmount": 0,
                "integerAmountBeforeDiscount": 0,
                "required": true
            },
            "socialData": {
            },
            "status": "ORDER_STATUS_INCOMPLETE",
            "storeCredit": {
                "amount": 0
            },
            "subtotal": {
                "amount": 225,
                "integerAmount": 22500
            },
            "taxes": [
                {
                    "amount": 0,
                    "name": "Tax"
                }
            ],
            "taxSubtotal": {
                "amount": 0,
                "integerAmount": 0
            },
            "taxTotal": {
                "amount": 0,
                "integerAmount": 0
            },
            "token": "*"
        }
    },
    "meta": {
        "deviceFingerprint": null
    }
}`;

export const consignmentsAndBilling = `{
    "billingAddress": {
        "address1": "",
        "address2": "",
        "city": "adcasdc",
        "company": "",
        "country": "United States",
        "countryCode": "US",
        "customFields": [],
        "email": "",
        "firstName": "",
        "id": "0000000000",
        "lastName": "",
        "phone": "",
        "postalCode": "22222",
        "shouldSaveAddress": false,
        "stateOrProvince": "Alabama",
        "stateOrProvinceCode": "AL"
    },
    "cart": {
        "baseAmount": 119.95,
        "cartAmount": 119.95,
        "coupons": [],
        "createdTime": "2022-08-10T06:11:21+00:00",
        "currency": {
            "code": "USD",
            "decimalPlaces": 2,
            "name": "US Dollar",
            "symbol": "$"
        },
        "customerId": 0,
        "discountAmount": 0,
        "discounts": [
            {
                "discountedAmount": 0,
                "id": "00000000-0000-0000-0000-000000000000"
            }
        ],
        "email": null,
        "id": "00000000-0000-0000-0000-000000000000",
        "isTaxIncluded": false,
        "lineItems": {
            "customItems": [],
            "digitalItems": [],
            "giftCertificates": [],
            "physicalItems": [
                {
                    "addedByPromotion": false,
                    "brand": "OFS",
                    "comparisonPrice": 119.95,
                    "couponAmount": 0,
                    "discountAmount": 0,
                    "discounts": [],
                    "extendedComparisonPrice": 119.95,
                    "extendedListPrice": 119.95,
                    "extendedSalePrice": 119.95,
                    "giftWrapping": null,
                    "id": "00000000-0000-0000-0000-000000000000",
                    "imageUrl": "tieredbasket.1657528585.190.285.jpg?c=1",
                    "isMutable": true,
                    "isShippingRequired": true,
                    "isTaxable": true,
                    "listPrice": 119.95,
                    "name": "[Sample] Tiered Wire Basket",
                    "options": [],
                    "originalPrice": 119.95,
                    "parentId": null,
                    "productId": 97,
                    "quantity": 1,
                    "salePrice": 119.95,
                    "sku": "TWB",
                    "url": "https://my-dev-store-758323881.store.bcdev/tiered-wire-basket/",
                    "variantId": 69
                }
            ]
        },
        "locale": "en",
        "updatedTime": "2022-08-10T06:12:15+00:00"
    },
    "consignments": [
        {
            "address": {
                "address1": "",
                "address2": "",
                "city": "Sydney",
                "company": "",
                "country": "United States",
                "countryCode": "US",
                "customFields": [],
                "email": "",
                "firstName": "",
                "lastName": "",
                "phone": "",
                "postalCode": "22222",
                "shouldSaveAddress": true,
                "stateOrProvince": "Alabama",
                "stateOrProvinceCode": "AL"
            },
            "availableShippingOptions": [
                {
                    "additionalDescription": "",
                    "cost": 0,
                    "description": "Free Shipping",
                    "id": "4dcbf24f457dd67d5f89bcf374e0bc9b",
                    "imageUrl": "",
                    "isRecommended": true,
                    "transitTime": "",
                    "type": "freeshipping"
                }
            ],
            "couponDiscounts": [],
            "discounts": [],
            "handlingCost": 0,
            "id": "0000000000000",
            "lineItemIds": [
                "00000000-0000-0000-0000-000000000000"
            ],
            "selectedShippingOption": {
                "additionalDescription": "",
                "cost": 0,
                "description": "Free Shipping",
                "id": "4dcbf24f457dd67d5f89bcf374e0bc9b",
                "imageUrl": "",
                "transitTime": "",
                "type": "freeshipping"
            },
            "shippingAddress": {
                "address1": "",
                "address2": "",
                "city": "Sydney",
                "company": "",
                "country": "United States",
                "countryCode": "US",
                "customFields": [],
                "email": "",
                "firstName": "",
                "lastName": "",
                "phone": "",
                "postalCode": "22222",
                "shouldSaveAddress": true,
                "stateOrProvince": "Alabama",
                "stateOrProvinceCode": "AL"
            },
            "shippingCost": 0
        }
    ],
    "coupons": [],
    "createdTime": "2022-08-10T06:11:21+00:00",
    "customer": {
        "addresses": [],
        "email": "",
        "firstName": "",
        "fullName": "",
        "id": 0,
        "isGuest": true,
        "lastName": "",
        "shouldEncourageSignIn": false,
        "storeCredit": 0
    },
    "customerMessage": "",
    "giftCertificates": [],
    "giftWrappingCostTotal": 0,
    "grandTotal": 119.95,
    "handlingCostTotal": 0,
    "id": "00000000-0000-0000-0000-000000000000",
    "isStoreCreditApplied": false,
    "orderId": null,
    "outstandingBalance": 119.95,
    "promotions": [],
    "shippingCostBeforeDiscount": 0,
    "shippingCostTotal": 0,
    "shouldExecuteSpamCheck": false,
    "subtotal": 119.95,
    "taxTotal": 0,
    "taxes": [
        {
            "amount": 0,
            "name": "Tax"
        }
    ],
    "updatedTime": "2022-08-10T06:12:15+00:00"
}`;
