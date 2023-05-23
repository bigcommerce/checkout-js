import { OrderSummaryItemProps } from '../../order/OrderSummaryItem';
import { apiEndpoint } from '../../recurly/config';

interface productsCheckoutDescriptionsType {
	data: Array<{
        id: string,
        checkoutDescription: null | string
    }>;
}

export default async function getProductsCheckoutDescriptions(ids: number[], currency: string, variant: "subscription" | "one-time-purchase"): Promise<productsCheckoutDescriptionsType> {
    const response = await fetch(`${apiEndpoint}/api/products-checkout-descriptions?ids=${ids.toString()}&currency=${currency}&variant=${variant}`, {
        headers: {'Content-Type': 'application/json'},
        method: 'GET',
    });
    const result = await response.json();

    if (response.status !== 200) {
        throw new Error(result.message);
    }

    return result;
}

export const isSubscription = (item: OrderSummaryItemProps) => {
    const {productOptions} = item;
    
    return productOptions && productOptions[0] && productOptions[0].content
        && (productOptions[0].content.toString().indexOf('sends every') !== -1
            || productOptions[0].content.toString().indexOf('send every') !== -1);
};