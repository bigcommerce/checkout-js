import { CardInstrument, LanguageService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { number } from 'card-validator';
import { compact } from 'lodash';
import React, { FunctionComponent, memo, ReactNode } from 'react';

import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps , PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';

import { withCheckout } from '../../checkout';
import { connectFormik, ConnectFormikProps } from '../../common/form';
import { CreditCardIconList, mapFromPaymentMethodCardType } from '../creditCard';

import BraintreePaypalCreditDescription from './BraintreePaypalCreditDescription';
import { hasCreditCardNumber } from './CreditCardFieldsetValues';
import getPaymentMethodDisplayName from './getPaymentMethodDisplayName';
import getPaymentMethodName from './getPaymentMethodName';
import { isHostedCreditCardFieldsetValues } from './HostedCreditCardFieldsetValues';
import PaymentMethodId from './PaymentMethodId';
import PaymentMethodType from './PaymentMethodType';

export interface PaymentMethodTitleProps {
    method: PaymentMethod;
    isSelected?: boolean;
    onUnhandledError?(error: Error): void;
}

interface WithPaymentTitleProps {
    instruments: CardInstrument[];
    cdnBasePath: string;
}

function getPaymentMethodTitle(
    language: LanguageService,
    basePath: string,
): (method: PaymentMethod) => {
    logoUrl: string;
    titleText: string,
    subtitle?: ReactNode | ((subtitleProps?: { onUnhandledError?(error: Error): void }) => ReactNode)
} {
    const cdnPath = (path: string) => `${basePath}${path}`;

    return (method) => {
        const paymentWithLogo = method.initializationData?.methodsWithLogo
            ? method.initializationData.methodsWithLogo
            : [];
        const methodName = getPaymentMethodName(language)(method);
        const methodDisplayName = getPaymentMethodDisplayName(language)(method);
        // TODO: API could provide the data below so UI can read simply read it.
        // However, I'm not sure how we deal with translation yet. TBC.
        const customTitles: { [key: string]: { logoUrl: string; titleText: string, subtitle?: ReactNode } } = {
            [PaymentMethodType.CreditCard]: {
                logoUrl: '',
                titleText: methodName,
            },
            [PaymentMethodId.BraintreeVenmo]: {
                logoUrl: method.logoUrl || '',
                titleText: method.logoUrl ? '' : methodDisplayName,
            },
            [PaymentMethodId.BraintreePaypalCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo_letter.svg'),
                titleText: methodDisplayName,
                subtitle: (props: { onUnhandledError?(error: Error): void }) => <BraintreePaypalCreditDescription {...props} />
            },
            [PaymentMethodType.PaypalCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo_letter.svg'),
                titleText: methodDisplayName,
            },
            [PaymentMethodId.BraintreeAch]: {
                logoUrl: method.logoUrl || '',
                titleText: methodDisplayName,
            },
            [PaymentMethodId.BraintreeLocalPaymentMethod]: {
                logoUrl: method.logoUrl || '',
                titleText: methodDisplayName,
            },
            [PaymentMethodId.PaypalCommerce]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo.svg'),
                titleText: '',
            },
            [PaymentMethodId.PaypalCommerceCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo_letter.svg'),
                titleText: methodDisplayName,
            },
            [PaymentMethodId.PaypalCommerceAlternativeMethod]: {
                logoUrl: method.logoUrl || '',
                titleText: method.logoUrl ? '' : methodDisplayName,
            },
            [PaymentMethodType.VisaCheckout]: {
                logoUrl: cdnPath('/img/payment-providers/visa-checkout.png'),
                titleText: methodName,
            },
            [PaymentMethodId.Affirm]: {
                logoUrl: cdnPath('/img/payment-providers/affirm-checkout-header.png'),
                titleText: language.translate('payment.affirm_display_name_text'),
            },
            [PaymentMethodId.Afterpay]: {
                logoUrl: cdnPath('/img/payment-providers/afterpay-badge-blackonmint.png'),
                titleText: methodName,
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
                titleText: '',
            },
            [PaymentMethodType.GooglePay]: {
                logoUrl: cdnPath('/img/payment-providers/google-pay.png'),
                titleText: '',
            },
            [PaymentMethodType.PayWithGoogle]: {
                logoUrl: cdnPath('/img/payment-providers/google-pay.png'),
                titleText: '',
            },
            [PaymentMethodId.DigitalRiver]: {
                logoUrl: '',
                titleText: language.translate('payment.digitalriver_display_name_text'),
            },
            [PaymentMethodId.Humm]: {
                logoUrl: cdnPath('/img/payment-providers/humm-checkout-header.png'),
                titleText: '',
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
                logoUrl: cdnPath(
                    `/img/payment-providers/${method.config.logo ?? 'opy_default.svg'}`,
                ),
                titleText: '',
            },
            [PaymentMethodType.Paypal]: {
                // TODO: method.id === PaymentMethodId.BraintreeVenmo should be removed after the PAYPAL-1380.checkout_button_strategies_update experiment removal
                logoUrl:
                    method.id === PaymentMethodId.BraintreeVenmo && method.logoUrl
                        ? method.logoUrl
                        : cdnPath('/img/payment-providers/paypalpaymentsprouk.png'),
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
                logoUrl: cdnPath(
                    `/img/payment-providers/barclaycard_${method.id.toLowerCase()}.png`,
                ),
                titleText: '',
            },
            [PaymentMethodId.AdyenV2]: {
                logoUrl: `https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/${
                    method.method === 'scheme' ? 'card' : method.method
                }.svg`,
                titleText: methodDisplayName,
            },
            [PaymentMethodId.AdyenV3]: {
                logoUrl: `https://checkoutshopper-live.adyen.com/checkoutshopper/images/logos/${
                    method.method === 'scheme' ? 'card' : method.method
                }.svg`,
                titleText: methodDisplayName,
            },
            [PaymentMethodId.Mollie]: {
                logoUrl:
                    method.method === 'credit_card'
                        ? ''
                        : cdnPath(`/img/payment-providers/mollie_${method.method}.svg`),
                titleText: methodDisplayName,
            },
            [PaymentMethodId.Checkoutcom]: {
                logoUrl: ['credit_card', 'card', 'checkoutcom'].includes(method.id)
                    ? ''
                    : cdnPath(`/img/payment-providers/checkoutcom_${method.id.toLowerCase()}.svg`),
                titleText: methodName,
            },
            [PaymentMethodId.StripeV3]: {
                logoUrl: paymentWithLogo.includes(method.id)
                    ? cdnPath(`/img/payment-providers/stripe-${method.id.toLowerCase()}.svg`)
                    : '',
                titleText:
                    method.method === 'iban'
                        ? language.translate('payment.stripe_sepa_display_name_text')
                        : methodName,
            },
            [PaymentMethodId.StripeUPE]: {
                logoUrl: paymentWithLogo.includes(method.id)
                    ? cdnPath(`/img/payment-providers/stripe-${method.id.toLowerCase()}.svg`)
                    : '',
                titleText:
                    method.method === 'iban'
                        ? language.translate('payment.stripe_sepa_display_name_text')
                        : methodName,
            },
            [PaymentMethodId.WorldpayAccess]: {
                logoUrl: '',
                titleText: language.translate('payment.credit_debit_card_text'),
            },
        };


        if (method.gateway === PaymentMethodId.BlueSnapDirect) {
            if (method.id === 'credit_card') {
                return { logoUrl: '', titleText: language.translate('payment.credit_card_text') };
            }

            if (method.id === 'ecp') {
                return { logoUrl: '', titleText: language.translate('payment.bluesnap_direct_electronic_check_label') };
            }

            if (method.id === 'banktransfer') {
                return { logoUrl: '', titleText: language.translate('payment.bluesnap_direct_local_bank_transfer_label') };
            }
        }

        if (method.id === PaymentMethodId.PaypalCommerceVenmo) {
            return customTitles[PaymentMethodId.PaypalCommerceAlternativeMethod];
        }

        // KLUDGE: 'paypal' is actually a credit card method. It is the only
        // exception to the rule below. We should probably fix it on API level,
        // but apparently it would break LCO if we are not careful.
        if (
            method.id === PaymentMethodId.PaypalPaymentsPro &&
            method.method === PaymentMethodType.CreditCard
        ) {
            return customTitles[PaymentMethodType.CreditCard];
        }

        if (method.id === PaymentMethodId.Ratepay) {
            return { logoUrl: method.logoUrl || '', titleText: language.translate('payment.ratepay.payment_method_title')};
        }

        return (
            customTitles[method.gateway || ''] ||
            customTitles[method.id] ||
            customTitles[method.method] ||
            customTitles[PaymentMethodType.CreditCard]
        );
    };
}

function getInstrumentForMethod(
    instruments: CardInstrument[],
    method: PaymentMethod,
    values: PaymentFormValues
): CardInstrument | undefined {
    const instrumentsForMethod = instruments.filter(instrument => instrument.provider === method.id);
    const selectedInstrument = instrumentsForMethod.find(instrument => instrument.bigpayToken === values.instrumentId);

    return selectedInstrument;
}

const PaymentMethodTitle: FunctionComponent<
    PaymentMethodTitleProps &
        WithLanguageProps &
        WithPaymentTitleProps &
        ConnectFormikProps<PaymentFormValues>
> = ({ cdnBasePath, onUnhandledError, formik: { values }, instruments, isSelected, language, method }) => {
    const methodName = getPaymentMethodName(language)(method);
    const { logoUrl, titleText, subtitle } = getPaymentMethodTitle(language, cdnBasePath)(method);

    const getSelectedCardType = () => {
        if (!isSelected) {
            return;
        }

        const instrumentSelected = getInstrumentForMethod(instruments, method, values);

        if (isHostedCreditCardFieldsetValues(values) && values.hostedForm.cardType) {
            return values.hostedForm.cardType;
        }

        if (hasCreditCardNumber(values) && values.ccNumber) {
            const { card } = number(values.ccNumber);

            if (!card) {
                return;
            }

            return card.type;
        }

        if (instrumentSelected) {
            return instrumentSelected.brand;
        }
    };

    const getSubtitle = () => {
        const node = subtitle instanceof Function ? subtitle({ onUnhandledError }) : subtitle;

        return node ? <div className="paymentProviderHeader-subtitleContainer">
            {node}
        </div> : null
    }

    return (
        <div className="paymentProviderHeader-container">
            <div
                className="paymentProviderHeader-nameContainer"
                data-test={`payment-method-${method.id}`}
            >
                {logoUrl && (
                    <img
                        alt={methodName}
                        className="paymentProviderHeader-img"
                        data-test="payment-method-logo"
                        src={logoUrl}
                    />
                )}

                {titleText && (
                    <div aria-level={6} className="paymentProviderHeader-name" data-test="payment-method-name" role="heading">
                        {titleText}
                    </div>
                )}

                {getSubtitle()}
            </div>
            <div className="paymentProviderHeader-cc">
                <CreditCardIconList
                    cardTypes={compact(method.supportedCards.map(mapFromPaymentMethodCardType))}
                    selectedCardType={getSelectedCardType()}
                />
            </div>
        </div>
    );
};

function mapToCheckoutProps({ checkoutState }: CheckoutContextProps): WithPaymentTitleProps | null {
    const {
        data: { getConfig, getInstruments },
    } = checkoutState;
    const config = getConfig();

    const instruments = getInstruments() || [];

    if (!config) {
        return null;
    }

    return {
        instruments,
        cdnBasePath: config.cdnPath,
    };
}

export default connectFormik(
    withLanguage(withCheckout(mapToCheckoutProps)(memo(PaymentMethodTitle))),
);
