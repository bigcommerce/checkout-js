import {
    ExtensionRegion,
    LineItemMap,
    ShopperCurrency,
    StoreCurrency,
    createCheckoutService,
    CheckoutSelectors
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, ReactNode, useMemo,useEffect,useState} from 'react';
import { Tax as CheckoutSdkTax } from '@bigcommerce/checkout-sdk';
import { Extension } from '@bigcommerce/checkout/checkout-extension';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummaryPrice from './OrderSummaryPrice';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';
import { CreateCertificate } from '../avalara-certificates';
import { calculateTaxes } from '../avalara-certificates/taxCalculation';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
}
export interface Tax extends CheckoutSdkTax {
    name: string;
    amount: number;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    isTaxIncluded,
    taxes,
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const [certIds, setCertIds] = useState<number[]>([]);
    useEffect(() => {
        const checkoutService = createCheckoutService();
        checkoutService.loadCheckout()
            .then((state: CheckoutSelectors) => {
                const shippingAddress = state.data.getShippingAddress();
                const cart = state.data.getCart();
                const customerId = state.data.getCustomer()?.id || '';
                const shippingCost = state.data.getConsignments()?.reduce((total, consignment) => {
                    return total + (consignment.selectedShippingOption?.cost || 0);
                }, 0);
                if (shippingAddress && cart && customerId) {
                    calculateTaxes(cart, shippingAddress, lineItems, customerId, shippingCost)
                        .then(taxCalculated => {
                            const { certificateIds } = taxCalculated;
                            setCertIds(certificateIds);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            })
            .catch((error: unknown) => {
                if (error instanceof Error) {
                    console.error('Error:', error.message);
                } else {
                    console.error('Error');
                }
            });
    }, [lineItems]);
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const displayInclusiveTax = isTaxIncluded && taxes && taxes.length > 0;
    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            <OrderSummaryHeader>{headerLink}</OrderSummaryHeader>

            <OrderSummarySection>
                <OrderSummaryItems displayLineItemsCount items={nonBundledLineItems} />
            </OrderSummarySection>

            <Extension region={ExtensionRegion.SummaryLastItemAfter} />

            <OrderSummarySection>
                <OrderSummarySubtotals isTaxIncluded={isTaxIncluded} taxes={taxes} {...orderSummarySubtotalsProps} />
                {additionalLineItems}
            </OrderSummarySection>
            <OrderSummarySection>
                <CreateCertificate certIds={certIds}  />
            </OrderSummarySection>

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
            </OrderSummarySection>

            {displayInclusiveTax && <OrderSummarySection>
                <h5
                    className="cart-taxItem cart-taxItem--subtotal optimizedCheckout-contentPrimary"
                    data-test="tax-text"
                >
                    <TranslatedString
                        id="tax.inclusive_label"
                    />
                </h5>
                {(taxes || []).map((tax, index) => (
                    <OrderSummaryPrice
                        amount={tax.amount}
                        key={index}
                        label={tax.name}
                        testId="cart-taxes"
                    />
                ))}
            </OrderSummarySection>}
        </article>
    );
};

export default OrderSummary;
