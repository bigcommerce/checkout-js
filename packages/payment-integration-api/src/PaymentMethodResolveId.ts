import RequireAtLeastOne from './RequireAtLeastOne';

type PaymentMethodResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    type?: string;
}>;

export default PaymentMethodResolveId;
