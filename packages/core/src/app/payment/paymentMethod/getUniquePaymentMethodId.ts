import { compact } from 'lodash';

export default function getUniquePaymentMethodId(methodId: string, gatewayId?: string): string {
    return compact([gatewayId, methodId]).join('-');
}

export function parseUniquePaymentMethodId(value: string): {
    methodId: string;
    gatewayId?: string;
} {
    const [gatewayId, methodId] = value.includes('-') ? value.split('-') : [undefined, value];

    return { gatewayId, methodId };
}
