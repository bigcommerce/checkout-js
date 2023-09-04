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

export const checkoutSettingsBodyMock = `{
    "context": {
        "flashMessages": [],
        "payment": {
            "token": "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNklqSXdNVGd3TkRJMk1UWXRjMkZ1WkdKdmVDSXNJbWx6Y3lJNkltaDBkSEJ6T2k4dllYQnBMbk5oYm1SaWIzZ3VZbkpoYVc1MGNtVmxaMkYwWlhkaGVTNWpiMjBpZlEuZXlKbGVIQWlPakUyT1RNNU5URTVOemdzSW1wMGFTSTZJbVk0TWpreE1EUmlMVEZsTWpJdE5EQTVPUzFpT0RRNUxUVTVPR1JoWXpnd1lqUmxNaUlzSW5OMVlpSTZJbWhuWkdOa2JuRTBZell5ZVhsak5YSWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzV6WVc1a1ltOTRMbUp5WVdsdWRISmxaV2RoZEdWM1lYa3VZMjl0SWl3aWJXVnlZMmhoYm5RaU9uc2ljSFZpYkdsalgybGtJam9pYUdka1kyUnVjVFJqTmpKNWVXTTFjaUlzSW5abGNtbG1lVjlqWVhKa1gySjVYMlJsWm1GMWJIUWlPblJ5ZFdWOUxDSnlhV2RvZEhNaU9sc2liV0Z1WVdkbFgzWmhkV3gwSWwwc0luTmpiM0JsSWpwYklrSnlZV2x1ZEhKbFpUcFdZWFZzZENKZExDSnZjSFJwYjI1eklqcDdJbTFsY21Ob1lXNTBYMkZqWTI5MWJuUmZhV1FpT2lKaWFXZGpiMjF0WlhKalpWVlRJbjE5LmRFd1haa0gzdGlrbEYwWkx2b2VWME1VYWxHVkttUXJ3UzRSM2l3NXo3MWVnMHhoZmhQVGJnRE9DVFN3TGV5NHd6bWFnZFNEdVdxYVRrRnV3eXRKNlBBIiwiY29uZmlnVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL2hnZGNkbnE0YzYyeXljNXIvY2xpZW50X2FwaS92MS9jb25maWd1cmF0aW9uIiwibWVyY2hhbnRBY2NvdW50SWQiOiJiaWdjb21tZXJjZVVTIiwiZ3JhcGhRTCI6eyJ1cmwiOiJodHRwczovL3BheW1lbnRzLnNhbmRib3guYnJhaW50cmVlLWFwaS5jb20vZ3JhcGhxbCIsImRhdGUiOiIyMDE4LTA1LTA4IiwiZmVhdHVyZXMiOlsidG9rZW5pemVfY3JlZGl0X2NhcmRzIl19LCJjbGllbnRBcGlVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvaGdkY2RucTRjNjJ5eWM1ci9jbGllbnRfYXBpIiwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwibWVyY2hhbnRJZCI6ImhnZGNkbnE0YzYyeXljNXIiLCJhc3NldHNVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczovL2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsInZlbm1vIjoib2ZmIiwiY2hhbGxlbmdlcyI6WyJjdnYiLCJwb3N0YWxfY29kZSJdLCJ0aHJlZURTZWN1cmVFbmFibGVkIjp0cnVlLCJhbmFseXRpY3MiOnsidXJsIjoiaHR0cHM6Ly9vcmlnaW4tYW5hbHl0aWNzLXNhbmQuc2FuZGJveC5icmFpbnRyZWUtYXBpLmNvbS9oZ2RjZG5xNGM2Mnl5YzVyIn0sInBheXBhbEVuYWJsZWQiOnRydWUsInBheXBhbCI6eyJiaWxsaW5nQWdyZWVtZW50c0VuYWJsZWQiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjpmYWxzZSwidW52ZXR0ZWRNZXJjaGFudCI6ZmFsc2UsImFsbG93SHR0cCI6dHJ1ZSwiZGlzcGxheU5hbWUiOiJCaWdjb21tZXJjZSIsImNsaWVudElkIjoiQVZ2WDdHcE8yRC0yaHFHWjVvX2VjSVR0cVU3d19RdUE5MVR0MmNvV1kzRnRISF9CYll3T2d5cEJkeS1aRVJoSnNZMFE1TEpGRTJuZmtyeDYiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJicmFpbnRyZWVDbGllbnRJZCI6Im1hc3RlcmNsaWVudDMiLCJtZXJjaGFudEFjY291bnRJZCI6ImJpZ2NvbW1lcmNlVVMiLCJjdXJyZW5jeUlzb0NvZGUiOiJVU0QifX0="
        },
        "checkoutId": "91a92698-7005-439e-82ce-3741d754c72c",
        "geoCountryCode": "PL"
    },
    "customization": {
        "languageData": []
    },
    "storeConfig": {
        "cdnPath": "https://cdn.integration.zone/r-e849966e0069a28867d05fd787170ce15dc24338",
        "checkoutSettings": {
            "checkoutBillingSameAsShippingEnabled": true,
            "hasMultiShippingEnabled": false,
            "enableOrderComments": true,
            "enableTermsAndConditions": false,
            "guestCheckoutEnabled": true,
            "isCardVaultingEnabled": true,
            "isCouponCodeCollapsed": true,
            "isExpressPrivacyPolicy": false,
            "isPaymentRequestEnabled": false,
            "isPaymentRequestCanMakePaymentEnabled": false,
            "isSignInEmailEnabled": false,
            "isSpamProtectionEnabled": false,
            "isTrustedShippingAddressEnabled": true,
            "orderTermsAndConditions": "",
            "orderTermsAndConditionsLocation": "payment",
            "orderTermsAndConditionsLink": "",
            "orderTermsAndConditionsType": "",
            "privacyPolicyUrl": "",
            "shippingQuoteFailedMessage": "Unfortunately one or more items in your cart can't be shipped to your location. Please choose a different delivery address.",
            "isAccountCreationEnabled": true,
            "realtimeShippingProviders": [
                "Fedex",
                "UPS",
                "USPS"
            ],
            "remoteCheckoutProviders": [
                "braintreepaypal",
                "braintreepaypalcredit",
                "applepay"
            ],
            "providerWithCustomCheckout": null,
            "isAnalyticsEnabled": false,
            "isStorefrontSpamProtectionEnabled": true,
            "googleMapsApiKey": "",
            "googleRecaptchaSitekey": "6LcvTksbAAAAAHeV9ajqHbWD382t8Mg5xkYuEwcs",
            "features": {
                "CHECKOUT-3573.expose_correct_error_message": true,
                "CHECKOUT-3671.do_not_render_payment_form_if_not_payment": true,
                "CHECKOUT-7222.checkout_settings_styling_section": true,
                "CHECKOUT-7255.remove_checkout_step_numbers": true,
                "CHECKOUT-4941.account_creation_in_checkout": true,
                "CHECKOUT-4183.checkout_google_address_autocomplete_uk": true,
                "DATA-6891.missing_orders_within_GA": true,
                "CHECKOUT-4726.add_address_in_multishipping_checkout": true,
                "CHECKOUT-4936.enable_custom_item_shipping": true,
                "PAYMENTS-6806.enable_ppsdk_strategy": false,
                "PAYMENTS-6799.localise_checkout_payment_error_messages": true,
                "PROJECT-3828.add_3ds_support_on_squarev2": true,
                "PAYPAL-1149.braintree-new-card-below-totals-banner-placement": true,
                "INT-4994.Opayo_3DS2": true,
                "CHECKOUT-7403.updated_cart_summary_modal": true,
                "INT-5826.amazon_relative_url": false,
                "INT-5826.google_hostname_alias": false,
                "INT-6399.amazon_pay_apb": true,
                "PROJECT-3483.amazon_pay_ph4": true,
                "PROJECT-4113.squarev2_web_payments_sdk": true,
                "PROJECT-4802.digital_river_paypal_support": false,
                "INT-6885.amazon_pay_ph4_us_only": false,
                "CHECKOUT-6879.enable_floating_labels": false,
                "PAYMENTS-7667.enable_vaulting_with_multishipping": true,
                "PAYPAL-1883.paypal-commerce-split-gateway": false,
                "PROJECT-2381.upgrade_checkout": true,
                "CHECKOUT-3984.upgrade_checkout_billing_step": true,
                "CHECKOUT-3790.upgrade_checkout_customer_step": true,
                "CHECKOUT-3790.upgrade_checkout_payment_step": true,
                "CHECKOUT-3983.upgrade_checkout_shipping_step": true,
                "CHECKOUT-3790.upgrade_order_confirmation": true,
                "CHECKOUT-3852.upgrade_cart_summary": true,
                "PROJECT-5029.checkout_extension": true,
                "CHECKOUT-6891.update_incomplete_order_wording_on_order_confirmation_page": false,
                "CHECKOUT-7647.express_privacy_policy": true,
                "INT-7676.authorizenet_use_new_googlepay_payment_strategy": false,
                "INT-7676.bnz_use_new_googlepay_payment_strategy": false,
                "INT-7676.checkoutcom_use_new_googlepay_payment_strategy": false,
                "INT-7676.cybersourcev2_use_new_googlepay_payment_strategy": false,
                "INT-7676.orbital_use_new_googlepay_payment_strategy": false,
                "INT-7676.stripe_use_new_googlepay_payment_strategy": false,
                "INT-7676.stripeupe_use_new_googlepay_payment_strategy": false,
                "INT-7676.worldpayaccess_use_new_googlepay_payment_strategy": false,
                "INT-5659.authorizenet_use_new_googlepay_customer_strategy": false,
                "INT-5659.bnz_use_new_googlepay_customer_strategy": false,
                "INT-5659.checkoutcom_use_new_googlepay_customer_strategy": false,
                "INT-5659.cybersourcev2_use_new_googlepay_customer_strategy": false,
                "INT-5659.orbital_use_new_googlepay_customer_strategy": false,
                "INT-5659.stripe_use_new_googlepay_customer_strategy": false,
                "INT-5659.stripeupe_use_new_googlepay_customer_strategy": false,
                "INT-5659.worldpayaccess_use_new_googlepay_customer_strategy": false
            },
            "requiresMarketingConsent": false,
            "checkoutUserExperienceSettings": {
                "walletButtonsOnTop": true,
                "floatingLabelEnabled": true
            }
        },
        "currency": {
            "code": "USD",
            "decimalPlaces": "2",
            "decimalSeparator": ".",
            "isTransactional": true,
            "symbolLocation": "left",
            "symbol": "$",
            "thousandsSeparator": ","
        },
        "displayDateFormat": "MMM do yyyy",
        "displaySettings": {
            "hidePriceFromGuests": false
        },
        "inputDateFormat": "MM/dd/yyyy",
        "formFields": {
            "billingAddressFields": [
                {
                    "id": "field_4",
                    "name": "firstName",
                    "custom": false,
                    "label": "First Name",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_5",
                    "name": "lastName",
                    "custom": false,
                    "label": "Last Name",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_6",
                    "name": "company",
                    "custom": false,
                    "label": "Company Name",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_7",
                    "name": "phone",
                    "custom": false,
                    "label": "Phone Number",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_8",
                    "name": "address1",
                    "custom": false,
                    "label": "Address Line 1",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_9",
                    "name": "address2",
                    "custom": false,
                    "label": "Address Line 2",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_10",
                    "name": "city",
                    "custom": false,
                    "label": "Suburb/City",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_11",
                    "name": "countryCode",
                    "custom": false,
                    "label": "Country",
                    "required": true,
                    "default": null,
                    "maxLength": false
                },
                {
                    "id": "field_12",
                    "name": "stateOrProvince",
                    "custom": false,
                    "label": "State/Province",
                    "required": true,
                    "default": null,
                    "maxLength": ""
                },
                {
                    "id": "field_13",
                    "name": "postalCode",
                    "custom": false,
                    "label": "Zip/Postcode",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                }
            ],
            "shippingAddressFields": [
                {
                    "id": "field_14",
                    "name": "firstName",
                    "custom": false,
                    "label": "First Name",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_15",
                    "name": "lastName",
                    "custom": false,
                    "label": "Last Name",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_16",
                    "name": "company",
                    "custom": false,
                    "label": "Company Name",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_17",
                    "name": "phone",
                    "custom": false,
                    "label": "Phone Number",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_18",
                    "name": "address1",
                    "custom": false,
                    "label": "Address Line 1",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_19",
                    "name": "address2",
                    "custom": false,
                    "label": "Address Line 2",
                    "required": false,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_20",
                    "name": "city",
                    "custom": false,
                    "label": "Suburb/City",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                },
                {
                    "id": "field_21",
                    "name": "countryCode",
                    "custom": false,
                    "label": "Country",
                    "required": true,
                    "default": null,
                    "maxLength": false
                },
                {
                    "id": "field_22",
                    "name": "stateOrProvince",
                    "custom": false,
                    "label": "State/Province",
                    "required": true,
                    "default": null,
                    "maxLength": ""
                },
                {
                    "id": "field_23",
                    "name": "postalCode",
                    "custom": false,
                    "label": "Zip/Postcode",
                    "required": true,
                    "default": "",
                    "maxLength": ""
                }
            ]
        },
        "links": {
            "cartLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/cart.php",
            "checkoutLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/checkout",
            "createAccountLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/login.php?action=create_account",
            "forgotPasswordLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/login.php?action=reset_password",
            "loginLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/login.php",
            "orderConfirmationLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone/checkout/order-confirmation",
            "siteLink": "https://nicktsybulko1693820210-testsworthy.my-integration.zone"
        },
        "paymentSettings": {
            "bigpayBaseUrl": "https://bigpay.integration.zone",
            "clientSidePaymentProviders": [
                "adyenv2",
                "adyenv3",
                "affirm",
                "afterpay",
                "authorizenet",
                "bnz",
                "barclays",
                "bigpaypay",
                "bluesnap",
                "bluesnapdirect",
                "bolt",
                "braintree",
                "braintreepaypal",
                "braintreepaypalcredit",
                "braintreevisacheckout",
                "cardconnect",
                "cba_mpgs",
                "ccavenuemars",
                "clearpay",
                "clover",
                "chasepay",
                "checkoutcom",
                "cybersource",
                "cybersourcev2",
                "converge",
                "elavon",
                "eway",
                "ewayrapid",
                "firstdatae4v14",
                "googlepayadyenv2",
                "googlepayadyenv3",
                "googlepaybraintree",
                "googlepaybnz",
                "googlepaycybersourcev2",
                "googlepaycheckoutcom",
                "googlepaystripe",
                "googlepayorbital",
                "googlepayworldpayaccess",
                "hps",
                "humm",
                "laybuy",
                "migs",
                "moneris",
                "mollie",
                "nmi",
                "orbital",
                "paymetric",
                "paypal",
                "paypalcommercecreditcards",
                "quadpay",
                "quickbooks",
                "sagepay",
                "securenet",
                "sezzle",
                "shopkeep",
                "squarev2",
                "stripe",
                "stripeupe",
                "stripev3",
                "usaepay",
                "vantiv",
                "vantivcore",
                "wepay",
                "worldpayaccess",
                "zip",
                "cabbage_pay",
                "cabbage_pay.card",
                "cabbage_pay.redirection",
                "dlocal",
                "dlocal.card",
                "dlocal.hosted",
                "electronic_payment_exchange",
                "electronic_payment_exchange.card",
                "mercado_pago",
                "mercado_pago.card",
                "mercado_pago.hosted",
                "pinwheel",
                "pinwheel.card",
                "serve_first",
                "serve_first.card",
                "windcave",
                "windcave.card",
                "bitpay",
                "bitpay.hosted",
                "optty",
                "optty.buy_now_pay_later",
                "nexi",
                "nexi.hosted",
                "transbank",
                "transbank.webpay_plus"
            ]
        },
        "shopperConfig": {
            "defaultNewsletterSignup": false,
            "passwordRequirements": {
                "alpha": "[A-Za-z]",
                "numeric": "[0-9]",
                "minlength": 7,
                "error": "Passwords must be at least 7 characters and contain both alphabetic and numeric characters."
            },
            "showNewsletterSignup": true
        },
        "storeProfile": {
            "orderEmail": "nick.tsybulko+1693820210@bigcommerce.com",
            "shopPath": "https://nicktsybulko1693820210-testsworthy.my-integration.zone",
            "storeCountry": "United States",
            "storeCountryCode": "US",
            "storeHash": "5l9qg11mjn",
            "storeId": 16225633,
            "storeName": "nick.tsybulko+1693820210 testsworthy",
            "storePhoneNumber": "",
            "storeLanguage": "en_US"
        },
        "imageDirectory": "product_images",
        "isAngularDebuggingEnabled": false,
        "shopperCurrency": {
            "code": "USD",
            "symbolLocation": "left",
            "symbol": "$",
            "decimalPlaces": "2",
            "decimalSeparator": ".",
            "thousandsSeparator": ",",
            "exchangeRate": 1,
            "isTransactional": true
        }
    }
}`;
