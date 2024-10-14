import { Address } from '@bigcommerce/checkout-sdk';
export interface Customer {
    id: number;
    email: string;
    isGuest: boolean;
    fullName: string;
}
export interface CertificateDetail {
    id: number;
    exemptPercentage: number;
    customers: { name: string }[];
    exemptionReason: { name: string };
}
 export interface CertificateFormValues {
    region: string;
    exemptionReason: string;
    effectiveDate: string;
    entityUseCode: string;
    exemptionDescription: string;
    certificateLabels: OptionType[];

}
export interface OptionType {
    value: string;
    label: string;
}

export interface CreateCertificateProps {
    customer: Customer;
    certIds: number[];
    shippingAddress: Address;
}