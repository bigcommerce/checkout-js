import type RequireAtLeastOne from './RequireAtLeastOne';

type PaymentMethodResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    type?: string;
    experiment?: string;
}>;

export default PaymentMethodResolveId;
