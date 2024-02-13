import { OrderSummaryItemProps } from '../../order/OrderSummaryItem';
import { apiEndpoint } from '../../recurly/config';

export enum VARIANT_TYPES {
  'subscription' = 'subscription',
  'oneOff' = 'oneOff',
}

export interface VariantAttributes {
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
  checkoutDescription?: string;
}

interface VariantAttributesData {
  data: Array<null | {
    variant: VariantAttributes & { type: VARIANT_TYPES };
    defaultVariant: VariantAttributes & { type: VARIANT_TYPES };
    bigCommerceProduct: any;
  }>;
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

export const checkHasSubscription = async (items: OrderSummaryItemProps[], currency: string) => {
  const variants = await getVariantsDataFromItems(items, currency);

  const subscriptionVariant = variants.data.find((variantData) => {
    if (!variantData) return false;

    const { type } = variantData.variant;

    return type === VARIANT_TYPES.subscription;
  });

  return !!subscriptionVariant;
};

export const checkIsSubscription = (item: OrderSummaryItemProps, currency: string) => {
  return checkHasSubscription([item], currency);
};

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
