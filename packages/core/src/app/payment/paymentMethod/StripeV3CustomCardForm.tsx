import classNames from 'classnames';
import React from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconHelp, IconLock } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';
import { CreditCardCodeTooltip } from '../creditCard';

export interface StripeV3CustomCardFormProps {
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
    };
}

const StripeV3CustomCardForm: React.FunctionComponent<StripeV3CustomCardFormProps> = ({
    options,
}) => (
    <div className="form-ccFields">
        <div className={classNames('form-field', 'form-field--stripe-ccNumber')}>
            <label
                className="form-label optimizedCheckout-form-label"
                htmlFor={options.cardNumberElementOptions.containerId}
            >
                <TranslatedString id="payment.credit_card_number_label" />
            </label>
            <div
                className={classNames(
                    'form-input',
                    'optimizedCheckout-form-input',
                    'has-icon',
                    'widget-input--stripev3',
                )}
                data-cse="CardNumber"
                id={options.cardNumberElementOptions.containerId}
            />
            <IconLock />
        </div>
        <div className="form-field form-field--ccExpiry">
            <label
                className="form-label optimizedCheckout-form-label"
                htmlFor={options.cardExpiryElementOptions.containerId}
            >
                <TranslatedString id="payment.credit_card_expiration_label" />
            </label>
            <div
                className={classNames(
                    'form-input',
                    'optimizedCheckout-form-input',
                    'widget-input--stripev3',
                )}
                data-cse="ExpiryDate"
                id={options.cardExpiryElementOptions.containerId}
            />
        </div>
        <div className="form-field form-ccFields-field--ccCvv">
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
                className={classNames(
                    'form-input',
                    'optimizedCheckout-form-input',
                    'has-icon',
                    'widget-input--stripev3',
                )}
                data-cse="SecurityCode"
                id={options.cardCvcElementOptions.containerId}
            />
            <IconLock />
        </div>
    </div>
);

export default StripeV3CustomCardForm;
