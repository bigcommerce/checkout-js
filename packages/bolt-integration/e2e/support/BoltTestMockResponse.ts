export const boltCart = `{
    "id": "bolt",
    "gateway": null,
    "logoUrl": "https://cdn.integration.zone/r-86785964566e19be3c6be0695c81e9ff89bfa029/modules/checkout/bolt/images/bolt_logo.svg",
    "method": "credit-card",
    "supportedCards": [
      "VISA",
      "MC",
      "AMEX",
      "DISCOVER",
      "DINERS",
      "JCB",
      "TOKENIZED_CARD"
    ],
    "providesShippingAddress": false,
    "config": {
      "displayName": "Bolt",
      "cardCode": null,
      "helpText": "",
      "enablePaypal": null,
      "merchantId": null,
      "is3dsEnabled": null,
      "testMode": true,
      "isVisaCheckoutEnabled": null,
      "requireCustomerCode": false,
      "isVaultingEnabled": false,
      "isVaultingCvvEnabled": false,
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
    "initializationData": {
      "publishableKey": "-EVWgjEciXhZ.zSWJTMF08oPS.321526f7eec99c381ed87d1a77c4a34281b291df8ad24dcd6ccdef910fe84c0d",
      "showInCheckout": true,
      "embeddedOneClickEnabled": true
    },
    "clientToken": null,
    "returnUrl": null
  }`;

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

export const merchantData = `{
    "merchant_id": "",
    "public_id": "zSWJTMF08oPS",
    "description": "BigCommerce partner sandbox - paymentonly - manual capture",
    "display_name": "BigCommerce partner sandbox - paymentonly - manual capture",
    "status": "active",
    "logo": {
      "domain": "img-sandbox.bolt.com",
      "resource": ""
    },
    "platform": "big_commerce",
    "hook_url": "https://bigpay.integration.zone/api/public/v1/payments/stores/16177081/providers/bolt/notifications",
    "hook_type": "bolt",
    "is_universal_merchant_api": false,
    "is_webhooks_v2": false,
    "shipping_url": "",
    "tax_url": "",
    "confirmation_redirect_url": "",
    "root_domain": "*",
    "checkout_type": "embedded_accounts",
    "onboarding_method": "manual",
    "support_email": "dev+test-merchant@bolt.com",
    "support_phone": "800-123-1234",
    "dev_email": "dev+test-merchant@bolt.com",
    "accept_discount_code": false,
    "use_multistep_checkout": false,
    "bolt_user_account_opt_out": false,
    "shipping_destinations": null,
    "store_highlights": null,
    "auto_capture": false,
    "client_order_validation": false,
    "back_office_processing": false,
    "no_payment_cancellation_notifications": false,
    "use_bolt_tokenizer": false,
    "send_failed_payment_hook_immediately": false,
    "show_cart_in_side_section": true,
    "show_billing_zip_field": false,
    "preauth_fail_abnormal_errors": false,
    "preauth_fail_timeouts": false,
    "afterpay_disable_autocapture": false,
    "minimize_delivery_override": false,
    "disable_payment_icons": false,
    "use_merchant_email_for_rejection_and_micro_auth": false,
    "product_add_ons": false,
    "copy_customizations": [],
    "style_customizations": [
      {
        "css_variable_name": "modal-overlay-color",
        "css_variable_value": "rgba(0, 0, 0, 0.25)"
      }
    ],
    "afterpay_settings": null,
    "paypal_settings": {
      "is_enabled": false,
      "use_autocapture": false,
      "minimum_amount": 0,
      "maximum_amount": 9223372036854776000,
      "currency": ""
    },
    "split_shipping_and_tax": false,
    "show_paypal": false,
    "accept_multiple_discounts": false,
    "back_button_usability": false,
    "locale_override": "",
    "allow_discount_removal": false,
    "analytics_tracking_support": false,
    "lob_po_box_verification": false,
    "require_company_name": false,
    "bolt_confirmation_page": false,
    "collect_recaptcha": false,
    "enable_order_notifications": false,
    "sms_notifications": true,
    "email_notifications": true,
    "bigc_include_dashes_in_phone_numbers": false,
    "bigc_ignore_tax": false,
    "postal_code_prefill": false,
    "enable_static_shipping": false,
    "static_shipping_option": null,
    "affirm_settings": null,
    "amazon_pay_settings": null,
    "klarna_settings": null,
    "sezzle_settings": null,
    "credova_settings": null,
    "google_pay_settings": null,
    "use_native_bigc_integration": false,
    "merchant_sms_number": "",
    "merchant_sms_autoreply": "",
    "is_provisioned": false,
    "shopper_dashboard_reordering": false,
    "single_field_payment_input": false,
    "show_email_suggestions": false,
    "bolt_sso": false,
    "custom_fields": [],
    "gift_card_field_enabled": false,
    "afterpay_enabled": false,
    "bigc_do_not_save_checkbox_to_staff_notes": false,
    "recaptcha_threshold": 0.4,
    "cart_display_id_in_transaction_view": false,
    "edit_quantity_in_cart": false,
    "enable_membership_pass": false,
    "enable_route_integration": false,
    "disable_undeliverable_shipping": false,
    "single_field_address_input": false,
    "enable_phone_order_risk_review": false,
    "limited_product_page_checkout": false,
    "dynamic_add_ons": false,
    "disable_street_lines_verification": false,
    "billing_address_in_payment": false,
    "enable_radial_paypal": false,
    "disable_manual_shipping_to_store_address": false,
    "enforce_gift_card_pin": false,
    "custom_account_checkbox": false,
    "gift_options": false,
    "validate_additional_account_data": false,
    "show_consent_above_pay": false,
    "upfront_apm_enabled": false,
    "shipment_cart_grouping": false,
    "threeds_enabled": false,
    "disable_pii_browser_storage": false,
    "enable_vat_included_notice": false,
    "legacy_shopify_integration": false,
    "shipping_tax_in_update_cart": false,
    "disable_browser_storage": false,
    "is_gdpr_compliant": false,
    "eu_only_billing_addresses": false,
    "enable_custom_char_limit": false,
    "android_url_redirect": false,
    "brightpearl": false,
    "render_streamlined_confirmation_page": false,
    "hide_bolt_terms_and_conditions": false,
    "merchant_description": "BigCommerce partner sandbox",
    "is_integration_enabled": false,
    "catalogue_ingestion_enabled": false,
    "enable_remote_checkout_orders": false,
    "suppress_checkout_transition_event": false,
    "safe_checkout_callbacks": false,
    "disable_account_welcome_email": false,
    "enable_trackjs_on_all_pages": false,
    "subscription_settings": null,
    "debug_data": {
      "bolt_plugin_version": "",
      "platform_version": "",
      "plugins": null,
      "bolt_plugin_configs": null
    },
    "enable_per_item_shipping": false,
    "enable_route_full_coverage": false,
    "enable_complex_copy_customization": false,
    "ship_to_store_search": false,
    "enable_item_metadata": false,
    "enable_loyalty_in_checkout": false,
    "call_update_cart_on_payment_method_change": false,
    "enable_paid_gift_wrapping": false,
    "add_100_cents_on_empty_round_up": false,
    "enable_manual_account_migration": false,
    "async_refund_amazon_pay": false,
    "async_refund_paypal": false,
    "discount_campaigns": null,
    "no_bolt_user_account_login": false,
    "shopper_widget_product_recommendations": false,
    "default_to_affirm_billing": false,
    "get_product_use_ugc_sanitization": false,
    "enable_cart_dynamic_add_ons": false,
    "bigcommerce_display_card_type": false,
    "allow_rewards_removal": false,
    "enable_shopper_assistant": false,
    "order_tracking_data_ingestion": false,
    "shopper_assistant_visual_configuration": null,
    "enable_discount_campaign": false,
    "enable_bolt_plus": false,
    "allow_any_billing_country": false,
    "enable_gift_checkout_experience": false,
    "force_phone_otp_authentication": false,
    "enable_setting_defaults_in_checkout": false,
    "enable_add_ons_page_experiment": false,
    "bigc_save_checkbox_to_customer_message": false,
    "point_of_sale_checkout": false,
    "hide_gift_card_pin": false,
    "add_delivery_date_per_item": false,
    "enable_store_credit_redemption": false,
    "apply_store_credit_in_payment": false,
    "created_at": "2019-07-03T00:03:58.855257Z",
    "disable_social_login_for_sso": false,
    "email_otp_fall_back_to_guest_in_checkout": false,
    "update_cart_on_complete_credit_card_input": false,
    "loqate_capture_address_autocompletion": false,
    "enable_dynamic_add_on_with_presets": false,
    "enable_update_fees_api": false,
    "hide_bolt_branding": false,
    "default_platform_account_creation_disabled": false,
    "recognize_session_in_embedded_accounts": false,
    "enable_bopis": false,
    "enable_bopis_shipment_creation": false,
    "embedded_accounts_custom_analytics_script": false,
    "embedded_accounts_no_consent_modal": false,
    "disable_embedded_google_maps": false,
    "disable_vat_notice_for_non_taxable": false,
    "use_discount_display_label_in_checkout": false,
    "enable_fetching_addons_from_cart_platform": false,
    "enable_share_checkout_links_button": false,
    "order_confirmation_emails": false,
    "refund_emails": false,
    "disable_bigcommerce_backend_order_creation": false,
    "fetch_cart_after_sso_login": false,
    "enable_checkout_links_v2": false,
    "enable_embedded_sso_accountless_login": false,
    "embedded_sso_merchant_account_creation": false,
    "use_tipser_product_catalog": false,
    "bigc_native_experience": false,
    "enable_commerce_os_analytics": false,
    "onboarding_status": "onboarding_complete"
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

export const orderPayment = `{
        "status":"ok",
        "three_ds_result": {
            "acs_url": null,
            "payer_auth_request": null,
            "merchant_data": null,
            "callback_url" :null
        },
        "errors": []
}`;
