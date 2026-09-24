import {
    type LineItemMap,
    type ShopperCurrency as ShopperCurrencyType,
    type StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { SummaryDrawerV2 } from '../common/components/SummaryDrawerV2';
import { type OrderSummarySubtotalsProps } from '../coupon';

import OrderSummary from './OrderSummary';
import PrintLink from './PrintLink';
import { getNonBundledItems } from './removeBundledItems';

export interface OrderSummaryDrawerV2Props extends OrderSummarySubtotalsProps {
    lineItems: LineItemMap;
    total: number;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrencyType;
    bundledItems?: Pick<LineItemMap, 'physicalItems' | 'digitalItems'>;
}

export const OrderSummaryDrawerV2: FunctionComponent<OrderSummaryDrawerV2Props> = ({
    lineItems,
    total,
    storeCurrency,
    shopperCurrency,
    bundledItems,
    ...subtotalProps
}) => {
    const { nonBundledItems } = getNonBundledItems(lineItems, bundledItems);

    return (
        <SummaryDrawerV2
            amount={total}
            currencyCode={shopperCurrency.code}
            nonBundledItems={nonBundledItems}
        >
            <OrderSummary
                {...subtotalProps}
                headerLink={<PrintLink />}
                lineItems={lineItems}
                shopperCurrency={shopperCurrency}
                storeCurrency={storeCurrency}
                total={total}
            />
        </SummaryDrawerV2>
    );
};
