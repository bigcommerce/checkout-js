import { type ShippingOptionsFormProps } from '../shippingOption/ShippingOptionsForm';

export const getShippingOptionIds = ({ consignments }: ShippingOptionsFormProps) => {
  const shippingOptionIds: Record<string, string> = {};

  (consignments || []).forEach((consignment) => {
    shippingOptionIds[consignment.id] = consignment.selectedShippingOption
      ? consignment.selectedShippingOption.id
      : '';
  });

  return { shippingOptionIds };
};
