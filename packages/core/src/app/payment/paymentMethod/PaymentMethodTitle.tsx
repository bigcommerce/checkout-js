import { type CardInstrument, type CheckoutSettings, type LanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';
import { number } from 'card-validator';
import classNames from 'classnames';
import { compact } from 'lodash';
import React, { type FunctionComponent, memo, type ReactNode } from 'react';

import { BigCommercePaymentsPayLaterBanner } from '@bigcommerce/checkout/bigcommerce-payments-utils'
import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { type CheckoutContextProps , type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { BraintreePaypalCreditBanner, PaypalCommerceCreditBanner } from '@bigcommerce/checkout/paypal-utils';
import { CreditCardIconList, mapFromPaymentMethodCardType } from '@bigcommerce/checkout/ui';

import { withCheckout } from '../../checkout';
import { connectFormik, type ConnectFormikProps } from '../../common/form';
import { isExperimentEnabled } from '../../common/utility';

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
    checkoutSettings: CheckoutSettings;
    storeCountryCode: string;
    cdnBasePath: string;
}

interface PaymentMethodSubtitleProps {
    onUnhandledError?(error: Error): void;
    methodId: string;
}

type SubtitleType = ReactNode | ((subtitleProps?: PaymentMethodSubtitleProps) => ReactNode);

export function getPaymentMethodTitle(
    language: LanguageService,
    basePath: string,
    checkoutSettings: CheckoutSettings,
    storeCountryCode: string,
): (method: PaymentMethod) => {
    logoUrl: string;
    titleText: string,
    subtitle?: SubtitleType
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
        const customTitles: { [key: string]: { logoUrl: string; titleText: string, subtitle?: ReactNode | ((props: any) => ReactNode) } } = {
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
                subtitle: (props: PaymentMethodSubtitleProps): ReactNode => (
                    <BraintreePaypalCreditBanner containerId='braintree-credit-banner-container' {...props} />
                ),
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
            [PaymentMethodId.BigCommercePaymentsPayPal]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo.svg'),
                titleText: '',
                subtitle: (props: PaymentMethodSubtitleProps) => <BigCommercePaymentsPayLaterBanner {...props} />
            },
            [PaymentMethodId.BigCommercePaymentsPayLater]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo_letter.svg'),
                titleText: methodDisplayName,
                subtitle: (props: PaymentMethodSubtitleProps) => <BigCommercePaymentsPayLaterBanner {...props} />
            },
            [PaymentMethodId.BigCommercePaymentsAlternativeMethod]: {
                logoUrl: method.logoUrl || '',
                titleText: method.logoUrl ? '' : methodDisplayName,
            },
            [PaymentMethodId.PaypalCommerce]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo.svg'),
                titleText: '',
                subtitle: (props: PaymentMethodSubtitleProps) => <PaypalCommerceCreditBanner containerId='paypal-commerce-banner-container' {...props} />
            },
            [PaymentMethodId.PaypalCommerceCredit]: {
                logoUrl: cdnPath('/img/payment-providers/paypal_commerce_logo_letter.svg'),
                titleText: methodDisplayName,
                subtitle: (props: PaymentMethodSubtitleProps) => <PaypalCommerceCreditBanner containerId='paypal-commerce-credit-banner-container' {...props} />
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
                logoUrl: isExperimentEnabled(checkoutSettings, 'PROJECT-6993.change_afterpay_logo_for_us_stores') && storeCountryCode === 'US' ? cdnPath('/img/payment-providers/afterpay-new-us.svg') : cdnPath('/img/payment-providers/afterpay-badge-blackonmint.png'),
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
            [PaymentMethodId.Humm]: {
                logoUrl: cdnPath('/img/payment-providers/humm-checkout-header.png'),
                titleText: '',
            },
            [PaymentMethodId.Klarna]: {
                logoUrl: method.initializationData?.enableBillie
                        ? cdnPath('/img/payment-providers/klarna-billie-header.png')
                        : cdnPath('/img/payment-providers/klarna-header.png'),
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
            [PaymentMethodType.Paypal]: {
                // TODO: method.id === PaymentMethodId.BraintreeVenmo should be removed after the PAYPAL-1380.checkout_button_strategies_update experiment removal
                logoUrl:
                    method.id === PaymentMethodId.BraintreeVenmo && method.logoUrl
                        ? method.logoUrl
                        : cdnPath('/img/payment-providers/paypalpaymentsprouk.png'),
                titleText: '',
                subtitle: (props: PaymentMethodSubtitleProps): ReactNode => (
                    <BraintreePaypalCreditBanner containerId='braintree-banner-container' {...props} />
                ),
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

        if (
          method.gateway === PaymentMethodId.BigCommercePaymentsAlternativeMethod &&
          method.id === PaymentMethodId.Klarna
        ) {
            return {
                logoUrl: cdnPath('/img/payment-providers/klarna.png'),
                titleText: methodDisplayName,
            };
        }

        if (method.id === PaymentMethodId.BigCommercePaymentsVenmo) {
            return customTitles[PaymentMethodId.BigCommercePaymentsAlternativeMethod];
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
            return { logoUrl: method.logoUrl || '', titleText: language.translate('payment.ratepay.payment_method_title') };
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
> = ({ cdnBasePath, checkoutSettings, storeCountryCode, onUnhandledError, formik: { values }, instruments, isSelected, language, method }) => {
    const methodName = getPaymentMethodName(language)(method);
    const { logoUrl, titleText, subtitle } = getPaymentMethodTitle(language, cdnBasePath, checkoutSettings, storeCountryCode)(method);
    const { themeV2 } = useThemeContext();

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
        const node = subtitle instanceof Function ? subtitle({ onUnhandledError, methodId: method.id }) : subtitle;

        return node ? <div className="paymentProviderHeader-subtitleContainer">
            {node}
        </div> : null
    }

    return (
        <div className={
            classNames(
                'paymentProviderHeader-container',
                { 'paymentProviderHeader-container-googlePay': method.id.includes('googlepay') },
            )
        }>
            <div
                className="paymentProviderHeader-nameContainer"
                data-test={`payment-method-${method.id}`}
            >
                {logoUrl && (
                    <img
                        alt={`${methodName} icon`}
                        className={classNames(
                            'paymentProviderHeader-img',
                            { 'paymentProviderHeader-img-applePay': method.id === 'applepay' },
                            { 'paymentProviderHeader-img-googlePay': method.id.includes('googlepay') },
                        )}
                        data-test="payment-method-logo"
                        src={logoUrl}
                    />
                )}

                {titleText && (
                    <div className={classNames('paymentProviderHeader-name',
                        { 'sub-header': themeV2 })}
                        data-test="payment-method-name">
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

    const storeCountryCode = config.storeProfile.storeCountryCode

    return {
        instruments,
        checkoutSettings: config.checkoutSettings,
        storeCountryCode,
        cdnBasePath: config.cdnPath,
    };
}

export default connectFormik(
    withLanguage(withCheckout(mapToCheckoutProps)(memo(PaymentMethodTitle))),
);
