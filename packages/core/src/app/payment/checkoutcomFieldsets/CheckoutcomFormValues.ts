export interface IdealCustomFormFieldsetValues {
    bic: string;
}

export interface SepaCustomFormFieldsetValues {
    iban: string;
    sepaMandate: boolean;
}

export interface FawryCustomFormFieldsetValues {
    customerMobile: string;
    customerEmail: string;
}

export interface DocumentOnlyCustomFormFieldsetValues {
    ccDocument?: string;
}
