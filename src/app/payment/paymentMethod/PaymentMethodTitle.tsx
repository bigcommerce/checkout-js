import { LanguageService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { number } from 'card-validator';
import { compact, startCase } from 'lodash';
import React, { memo, Fragment, FunctionComponent } from 'react';

import { withCheckout, CheckoutContextProps } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { withLanguage, WithLanguageProps } from '../../locale';
import { mapFromPaymentMethodCardType, CreditCardIconList } from '../creditCard';
import { PaymentFormValues } from '../PaymentForm';

import getPaymentMethodDisplayName from './getPaymentMethodDisplayName';
import getPaymentMethodName from './getPaymentMethodName';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodType from './PaymentMethodType';

export interface PaymentMethodTitleProps {
    method: PaymentMethod;
    isSelected?: boolean;
}

interface WithCdnPathProps {
    cdnBasePath: string;
}

function getPaymentMethodTitle(
    language: LanguageService,
    basePath: string
): (method: PaymentMethod) => { logoUrl: string; titleText: string } {
    const cdnPath = (path: string) => `${basePath}${path}`;

    return method => {
        const methodName = getPaymentMethodName(language)(method);
        const methodDisplayName = getPaymentMethodDisplayName(language)(method);
        // TODO: API could provide the data below so UI can read simply read it.
        // However, I'm not sure how we deal with translation yet. TBC.
        const customTitles: { [key: string]: { logoUrl: string; titleText: string } } = {
            [PaymentMethodType.CreditCard]: {
                logoUrl: '',
                titleText: methodName,
            },
            [PaymentMethodType.PaypalCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal-credit.png'),
                titleText: '',
            },
            [PaymentMethodId.PaypalCommerce]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo.svg'),
                titleText: '',
            },
            [PaymentMethodId.PaypalCommerceCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_pay_later.svg'),
                titleText: '',
            },
            [PaymentMethodId.PaypalCommerceAlternativeMethod]: {
                logoUrl: method.logoUrl || '',
                titleText: method.logoUrl ? '' : methodDisplayName,
            },
            [PaymentMethodType.VisaCheckout]: {
                logoUrl: cdnPath('/img/payment-providers/visa-checkout.png'),
                titleText: '',
            },
            [PaymentMethodId.Affirm]: {
                logoUrl: cdnPath('/img/payment-providers/affirm-checkout-header.png'),
                titleText: language.translate('payment.affirm_display_name_text'),
            },
            [PaymentMethodId.Afterpay]: {
                logoUrl: cdnPath('/img/payment-providers/afterpay-badge-blackonmint.png'),
                titleText: methodName,
            },
            [PaymentMethodId.Amazon]: {
                logoUrl: cdnPath('/img/payment-providers/amazon-header.png'),
                titleText: '',
            },
            [PaymentMethodId.AmazonPay]: {
                logoUrl: cdnPath('/img/payment-providers/amazon-header.png'),
                titleText: '',
            },
            [PaymentMethodId.ApplePay]: {
                logoUrl: cdnPath('/modules/checkout/applepay/images/applepay-header@2x.png'),
                titleText: '',
            },
            [PaymentMethodId.Bolt]: {
                logoUrl: '',
                titleText: methodDisplayName,
            },
            [PaymentMethodId.ChasePay]: {
                logoUrl: cdnPath('/img/payment-providers/chase-pay.png'),
                titleText: '',
            },
            [PaymentMethodId.Clearpay]: {
                logoUrl: cdnPath('/img/payment-providers/clearpay-header.png'),
                titleText: methodName,
            },
            [PaymentMethodType.GooglePay]: {
                logoUrl: cdnPath('/img/payment-providers/google-pay.png'),
                titleText: '',
            },
            [PaymentMethodId.DigitalRiver]: {
                logoUrl: '',
                titleText: language.translate('payment.digitalriver_display_name_text'),
            },
            [PaymentMethodId.Klarna]: {
                logoUrl: cdnPath('/img/payment-providers/klarna-header.png'),
                titleText: methodDisplayName,
            },
            [PaymentMethodId.Laybuy]: {
                logoUrl: cdnPath('/img/payment-providers/laybuy-checkout-header.png'),
                titleText: '',
            },
            [PaymentMethodId.Masterpass]: {
                logoUrl: 'https://masterpass.com/dyn/img/acc/global/mp_mark_hor_blk.svg',
                titleText: '',
            },
            [PaymentMethodId.Opy]: {
                logoUrl: cdnPath(`/img/payment-providers/${method.config.logo ?? 'opy_default.svg'}`),
                titleText: '',
            },
            [PaymentMethodType.Paypal]: {
                logoUrl: cdnPath('/img/payment-providers/paypalpaymentsprouk.png'),
                titleText: '',
            },
            [PaymentMethodId.Quadpay]: {
                logoUrl: cdnPath('/img/payment-providers/quadpay.png'),
                titleText: language.translate('payment.quadpay_display_name_text'),
            },
            [PaymentMethodId.Sezzle]: {
                logoUrl: cdnPath('/img/payment-providers/sezzle-checkout-header.png'),
                titleText: language.translate('payment.sezzle_display_name_text'),
            },
            [PaymentMethodId.Zip]: {
                logoUrl: cdnPath('/img/payment-providers/zip.png'),
                titleText: language.translate('payment.zip_display_name_text'),
            },
            [PaymentMethodType.Barclaycard]: {
                logoUrl: cdnPath(`/img/payment-providers/barclaycard_${method.id.toLowerCase()}.png`),
                titleText: '',
            },
            [PaymentMethodId.AdyenV2]: {
                logoUrl: `https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/${(method.method === 'scheme') ? 'card' : method.method}.svg`,
                titleText: methodDisplayName,
            },
            [PaymentMethodId.Mollie]: {
                logoUrl: method.method === 'credit_card' ? '' : cdnPath(`/img/payment-providers/mollie_${method.method}.svg`),
                titleText: method.method === 'credit_card' ? startCase(methodName) : methodName,
            },
            [PaymentMethodId.Checkoutcom]: {
                logoUrl: ['credit_card', 'card', 'checkoutcom'].includes(method.id) ? '' : cdnPath(`/img/payment-providers/checkoutcom_${method.id.toLowerCase()}.svg`),
                titleText: methodName,
            },
            [PaymentMethodId.StripeV3]: {
                logoUrl: '',
                titleText: method.method === 'iban' ? language.translate('payment.stripe_sepa_display_name_text') : methodName,
            },
        };

        // KLUDGE: 'paypal' is actually a credit card method. It is the only
        // exception to the rule below. We should probably fix it on API level,
        // but apparently it would break LCO if we are not careful.
        if (method.id === PaymentMethodId.PaypalPaymentsPro && method.method === PaymentMethodType.CreditCard) {
            return customTitles[PaymentMethodType.CreditCard];
        }

        return (
            customTitles[method.gateway || ''] ||
            customTitles[method.id] ||
            customTitles[method.method] ||
            customTitles[PaymentMethodType.CreditCard]
        );
    };
}

const PaymentMethodTitle: FunctionComponent<PaymentMethodTitleProps & WithLanguageProps & WithCdnPathProps & ConnectFormikProps<PaymentFormValues>> = ({
    cdnBasePath,
    formik: { values },
    isSelected,
    language,
    method,
}) => {
    const methodName = getPaymentMethodName(language)(method);
    const { logoUrl, titleText } = getPaymentMethodTitle(language, cdnBasePath)(method);

    const getSelectedCardType = () => {
        if (!isSelected) {
            return;
        }

        if ('hostedForm' in values && 'cardType' in values.hostedForm && values.hostedForm.cardType) {
            return values.hostedForm.cardType;
        }

        if ('ccNumber' in values && values.ccNumber) {
            const { card } = number(values.ccNumber);

            if (!card) {
                return;
            }

            return card.type;
        }
    };

    return (
        <Fragment>
            { logoUrl && <img
                alt={ methodName }
                className="paymentProviderHeader-img"
                data-test="payment-method-logo"
                src={ logoUrl }
            /> }

            { titleText && <span
                className="paymentProviderHeader-name"
                data-test="payment-method-name"
            >
                { titleText }
            </span> }

            <div className="paymentProviderHeader-cc">
                <CreditCardIconList
                    cardTypes={ compact(method.supportedCards.map(mapFromPaymentMethodCardType)) }
                    selectedCardType={ getSelectedCardType() }
                />
            </div>
        </Fragment>
    );
};

function mapToCdnPathProps({ checkoutState }: CheckoutContextProps): WithCdnPathProps | null {
    const { data: { getConfig } } = checkoutState;
    const config = getConfig();

    if (!config) {
        return null;
    }

    return {
        cdnBasePath: config.cdnPath,
    };
}

export default connectFormik(withLanguage(withCheckout(mapToCdnPathProps)(memo(PaymentMethodTitle))));
