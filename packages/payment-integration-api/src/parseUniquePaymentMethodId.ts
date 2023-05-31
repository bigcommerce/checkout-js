export default function parseUniquePaymentMethodId(value: string): {
    methodId: string;
    gatewayId?: string;
} {
    const [gatewayId, methodId] = value.indexOf('-') > -1 ? value.split('-') : [undefined, value];

    return { gatewayId, methodId };
}
