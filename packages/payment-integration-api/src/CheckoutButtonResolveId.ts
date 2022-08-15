import RequireAtLeastOne from './RequireAtLeastOne';

type CheckoutButtonResolveId = RequireAtLeastOne<{
    id?: string;
    gateway?: string;
    default?: boolean;
}>;

export default CheckoutButtonResolveId;
