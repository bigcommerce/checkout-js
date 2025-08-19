import { type LineItem, type LineItemOption } from "@bigcommerce/checkout-sdk";

const generateHash = (values: string[]): string => {
  return btoa(encodeURIComponent(values.join('-')));
};

const generateProductOptionsHash = (options: LineItemOption[] | undefined): string => {
  if (!options) {
    return '';
  }

  return generateHash(
    options.map((option) =>
      generateHash([
        option.name,
        option.nameId.toString(),
        option.value,
        option.valueId ? option.valueId.toString() : '',
      ]),
    ),
  );
};

export const generateItemHash = (item: LineItem): string => {
  return generateHash([
    item.productId.toString(),
    item.variantId.toString(),
    item.sku,
    generateProductOptionsHash(item.options),
  ]);
};
