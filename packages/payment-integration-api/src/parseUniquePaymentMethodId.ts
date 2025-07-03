export default function parseUniquePaymentMethodId(value: string): {
    methodId: string;
    gatewayId?: string;
} {
    const [gatewayId, methodId] = value.includes('-') ? value.split('-') : [undefined, value];

    return { gatewayId, methodId };
}
