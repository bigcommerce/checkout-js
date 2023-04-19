import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconHelp } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';
import { CreditCardCodeTooltip } from '../creditCard';

import MollieAPMCustomForm from './MollieAPMCustomForm';

export interface MollieCustomCardFormProps {
    options: {
        cardNumberElementOptions: {
            containerId: string;
        };
        cardExpiryElementOptions: {
            containerId: string;
        };
        cardCvcElementOptions: {
            containerId: string;
        };
        cardHolderElementOptions: {
            containerId: string;
        };
    };
    isCreditCard: boolean;
    method: PaymentMethod;
}

const MollieCustomCardForm: React.FunctionComponent<MollieCustomCardFormProps> = ({
    options,
    isCreditCard,
    method,
}) =>
    !isCreditCard ? (
        <MollieAPMCustomForm method={method} />
    ) : (
        <div className="form-ccFields">
            <div className={classNames('form-field', 'mollie-full')}>
                <label
                    className="form-label optimizedCheckout-form-label"
                    htmlFor={options.cardNumberElementOptions.containerId}
                >
                    <TranslatedString id="payment.credit_card_number_label" />
                </label>
                <div
                    className={classNames('form-input', 'optimizedCheckout-form-input', 'has-icon')}
                    data-cse="CardNumber"
                    id={options.cardNumberElementOptions.containerId}
                />
            </div>
            <div className={classNames('form-field', 'mollie-full')}>
                <label
                    className="form-label optimizedCheckout-form-label"
                    htmlFor={options.cardHolderElementOptions.containerId}
                >
                    <TranslatedString id="payment.credit_card_name_label" />
                </label>
                <div
                    className={classNames('form-input', 'optimizedCheckout-form-input')}
                    data-cse="CardHolder"
                    id={options.cardHolderElementOptions.containerId}
                />
            </div>
            <div className={classNames('form-field', 'mollie-aside', 'mollie-paddingRight')}>
                <label
                    className="form-label optimizedCheckout-form-label"
                    htmlFor={options.cardCvcElementOptions.containerId}
                >
                    <TranslatedString id="payment.credit_card_cvv_label" />
                    <TooltipTrigger placement="top-start" tooltip={<CreditCardCodeTooltip />}>
                        <span className="has-tip">
                            <IconHelp />
                        </span>
                    </TooltipTrigger>
                </label>
                <div
                    className={classNames('form-input', 'optimizedCheckout-form-input')}
                    data-cse="SecurityCode"
                    id={options.cardCvcElementOptions.containerId}
                />
            </div>
            <div className={classNames('form-field', 'mollie-aside')}>
                <label
                    className="form-label optimizedCheckout-form-label"
                    htmlFor={options.cardExpiryElementOptions.containerId}
                >
                    <TranslatedString id="payment.credit_card_expiration_label" />
                </label>
                <div
                    className={classNames('form-input', 'optimizedCheckout-form-input')}
                    data-cse="ExpiryDate"
                    id={options.cardExpiryElementOptions.containerId}
                />
            </div>
        </div>
    );

export default MollieCustomCardForm;
