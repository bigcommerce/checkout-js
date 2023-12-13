import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useMemo } from 'react';

import { preventDefault } from '@bigcommerce/checkout/dom-utils';
import { TranslatedString, withCurrency, WithCurrencyProps } from '@bigcommerce/checkout/locale';
import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { CheckboxInput } from '../../ui/form';
import { Tooltip, TooltipTrigger } from '../../ui/tooltip';

export interface StoreCreditFieldProps {
    availableStoreCredit: number;
    name: string;
    usableStoreCredit: number;
    isStoreCreditApplied: boolean;
    onChange?(value: boolean): void;
}

const StoreCreditField: FunctionComponent<StoreCreditFieldProps & WithCurrencyProps> = ({
    availableStoreCredit,
    currency,
    name,
    onChange = noop,
    usableStoreCredit,
    isStoreCreditApplied,
}) => {
    const {
        checkoutState: {
            statuses: { isSubmittingOrder }
        }
    } = useCheckout();

    const handleChange = useCallback((event) => onChange(event.target.checked), [onChange]);
    const labelContent = useMemo(
        () => (
            <>
                <TranslatedString id="redeemable.apply_store_credit_before_action" />{' '}
                <TooltipTrigger
                    placement="top-start"
                    tooltip={
                        <Tooltip testId="payment-store-credit-tooltip">
                            <TranslatedString
                                data={{
                                    storeCredit: currency.toCustomerCurrency(availableStoreCredit),
                                }}
                                id="redeemable.store_credit_available_text"
                            />
                        </Tooltip>
                    }
                >
                    <a href="#" onClick={preventDefault()}>
                        {currency.toCustomerCurrency(usableStoreCredit)}
                    </a>
                </TooltipTrigger>{' '}
                <TranslatedString id="redeemable.apply_store_credit_after_action" />
            </>
        ),
        [availableStoreCredit, currency, usableStoreCredit],
    );

    return (
        <CheckboxInput
            checked={isStoreCreditApplied}
            disabled={isSubmittingOrder()}
            id={name}
            label={labelContent}
            name={name}
            onChange={handleChange}
            value={name}
        />
    );
};

export default withCurrency(StoreCreditField);
