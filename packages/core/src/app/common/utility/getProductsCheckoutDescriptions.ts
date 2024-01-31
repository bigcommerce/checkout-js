import { OrderSummaryItemProps } from '../../order/OrderSummaryItem';
import { apiEndpoint } from '../../recurly/config';

interface ProductsCheckoutDescriptionsType {
  data: Array<{
    id: string;
    checkoutDescription: null | string;
  }>;
}

export enum VARIANT_TYPES {
    'subscription' = 'subscription',
    'oneOff' = 'oneOff',
}

interface VariantAttributes {
  id: number | string;
  globalVariantSku: string;
  usaVariantSku: string;
  variantName?: string;
  image?: any[];
  label?: string;
  frequencyNote?: string;
  supplyAmount?: string;
  supplyValue?: number;
  sendFrequency?: string;
  billingPeriod?: number;
  manualPricing?: any[];
  variantDiscounts?: any[];
}

interface VariantAttributesData {
  data: Array<null | {
    variant: VariantAttributes & {type: VARIANT_TYPES};
  }>;
}

export default async function getProductsCheckoutDescriptions(
  ids: number[],
  currency: string,
  variant: 'subscription' | 'one-time-purchase',
): Promise<ProductsCheckoutDescriptionsType> {
  const response = await fetch(
    `${apiEndpoint}/api/products-checkout-descriptions?ids=${ids.toString()}&currency=${currency}&variant=${variant}`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    },
  );
  const result = await response.json();

  if (response.status !== 200) {
    throw new Error(result.message);
  }

  return result;
}

export async function getVariantCraftDetails(
  productIds: number[],
  variantSkus: Array<number | string>,
  currency: string,
): Promise<VariantAttributesData> {
  const response = await fetch(
    `${apiEndpoint}/api/get-products-variants-craft-details?ids=${productIds.toString()}&skus=${variantSkus.toString()}&currency=${currency}`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    },
  );
  const result = await response.json();

  if (response.status !== 200) {
    throw new Error(result.message);
  }

  return result;
}

export const isSubscription = (item: OrderSummaryItemProps) => {
  const { productOptions } = item;

  return (
    productOptions &&
    productOptions[0] &&
    productOptions[0].content &&
    (productOptions[0].content.toString().indexOf('sends every') !== -1 ||
      productOptions[0].content.toString().indexOf('send every') !== -1)
  );
}; // @TODO - update isSubscription test

export async function getVariantsDataFromItems(
  items: OrderSummaryItemProps[],
  currency: string,
): Promise<VariantAttributesData> {
  const productIds: number[] = [];
  const variantSkus: Array<number | string> = [];

  items.forEach((item) => {
    if (item.productId && item.sku) {
      productIds.push(item.productId);
      variantSkus.push(item.sku);
    }
  });

  const [variants] = await Promise.all([getVariantCraftDetails(productIds, variantSkus, currency)]);

  return variants;
}
