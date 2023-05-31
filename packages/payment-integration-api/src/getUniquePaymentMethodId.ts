import { compact } from 'lodash';

export default function getUniquePaymentMethodId(methodId: string, gatewayId?: string): string {
    return compact([gatewayId, methodId]).join('-');
}
