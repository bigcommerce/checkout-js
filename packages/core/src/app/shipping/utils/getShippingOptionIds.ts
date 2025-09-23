import { type ShippingOptionsFormProps } from "../shippingOption/ShippingOptionsForm";

export const getShippingOptionIds = ({ consignments }: ShippingOptionsFormProps) => {
    const shippingOptionIds: { [id: string]: string } = {};

    (consignments || []).forEach((consignment) => {
        shippingOptionIds[consignment.id] = consignment.selectedShippingOption
            ? consignment.selectedShippingOption.id
            : '';
    });

    return { shippingOptionIds };
};
