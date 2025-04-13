export const order = `{
    "orderId": 344,
    "cartId": "6ded1e52-c165-4e01-8e7b-f7f12846c0d3",
    "currency": {
      "name": "US Dollars",
      "code": "USD",
      "symbol": "$",
      "decimalPlaces": 2
    },
    "isTaxIncluded": false,
    "baseAmount": 225,
    "discountAmount": 0,
    "orderAmount": 225,
    "orderAmountAsInteger": 22500,
    "shippingCostTotal": 0,
    "shippingCostBeforeDiscount": 0,
    "handlingCostTotal": 0,
    "giftWrappingCostTotal": 0,
    "coupons": [],
    "lineItems": {
      "physicalItems": [
        {
          "id": 245,
          "productId": 86,
          "name": "[Sample] Able Brewing System",
          "url": "https://my-dev-store-23818419.store.bcdev/able-brewing-system",
          "sku": "ABS",
          "quantity": 1,
          "isTaxable": true,
          "giftWrapping": null,
          "imageUrl": "https://lateshadazzled-cloud-dev-vm.store.bcdev/store/cr8jr1kmlt/products/86/images/286/ablebrewingsystem4.1714400570.190.285.jpg?c=1",
          "discounts": [],
          "discountAmount": 0,
          "couponAmount": 0,
          "listPrice": 225,
          "salePrice": 225,
          "extendedListPrice": 225,
          "extendedSalePrice": 225,
          "extendedComparisonPrice": 225,
          "categories": [
            [
              {
                "name": "Shop All"
              }
            ],
            [
              {
                "name": "Kitchen"
              }
            ]
          ],
          "type": "physical",
          "variantId": 66,
          "socialMedia": [
            {
              "channel": "Facebook",
              "code": "fb",
              "text": "I just bought '[Sample] Able Brewing System' on My Dev Store 23818419",
              "link": "http://www.facebook.com/sharer/sharer.php?p%5Burl%5D=https%3A%2F%2Fmy-dev-store-23818419.store.bcdev%2Fable-brewing-system"
            },
            {
              "channel": "Twitter",
              "code": "tw",
              "text": "I just bought '[Sample] Able Brewing System' on My Dev Store 23818419",
              "link": "https://twitter.com/intent/tweet?url=https%3A%2F%2Fmy-dev-store-23818419.store.bcdev%2Fable-brewing-system&text=I+just+bought+%27%5BSample%5D+Able+Brewing+System%27+on+My+Dev+Store+23818419"
            }
          ],
          "options": []
        }
      ],
      "digitalItems": [],
      "giftCertificates": []
    },
    "customerId": 0,
    "billingAddress": {
      "firstName": "John",
      "lastName": "Smith",
      "email": "test@test.com",
      "company": "",
      "address1": "43 High Ridge Street",
      "address2": "",
      "city": "New York",
      "stateOrProvince": "New York",
      "stateOrProvinceCode": "NY",
      "country": "United States",
      "countryCode": "US",
      "postalCode": "10016",
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
    "fees": [],
    "consignments": {
      "shipping": [
        {
          "lineItems": [
            {
              "id": 245
            }
          ],
          "shippingAddressId": 244,
          "firstName": "John",
          "lastName": "Smith",
          "company": "",
          "address1": "43 High Ridge Street",
          "address2": "",
          "city": "New York",
          "stateOrProvince": "New York",
          "postalCode": "10016",
          "country": "United States",
          "countryCode": "US",
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
          "shippingZoneId": 1,
          "shippingZoneName": "United States",
          "customFields": [],
          "discounts": []
        }
      ],
      "pickup": []
    },
    "payments": []
  }`;

export const affirmCart = `{
    "id": "affirm",
    "gateway": null,
    "logoUrl": "https://lateshadazzled-cloud-dev-vm.store.bcdev/rHEAD/modules/checkout/affirm/images/affirm_logo.png",
    "method": "affirm",
    "supportedCards": [],
    "providesShippingAddress": false,
    "config": {
        "displayName": "Affirm",
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
        "logo": null,
        "showCardHolderName": null
    },
    "type": "PAYMENT_TYPE_API",
    "initializationStrategy": {
        "type": "not_applicable"
    },
    "nonce": null,
    "initializationData": null,
    "clientToken": "BZXX1Q1YF6Y59QNH",
    "returnUrl": null
}`;

export const orderPayment =
    '{"status":"ok","three_ds_result":{"acs_url":null,"payer_auth_request":null,"merchant_data":null,"callback_url":null},"errors":[]}';
