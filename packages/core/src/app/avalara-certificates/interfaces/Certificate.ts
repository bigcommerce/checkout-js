
export interface Customer {
    id: number;
    companyId: number;
    customerCode: string;
    name: string;
    attnName: string;
    line1: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
    faxNumber: string;
    emailAddress: string;
    createdDate: string;
    modifiedDate: string;
    country: string;
    region: string;
    isBill: boolean;
    isShip: boolean;
}

export interface ExposureZone {
    id: number;
    name: string;
    tag: string;
    description: string;
    region: string;
    country: string;
}

export interface ValidatedExemptionReason {
    id: number;
    name: string;
}

export interface Certificate {
    id: number;
    companyId: number;
    signedDate: string;
    expirationDate: string;
    filename: string;
    documentExists: boolean;
    valid: boolean;
    verified: boolean;
    exemptPercentage: number;
    isSingleCertificate: boolean;
    exemptionNumber: string;
    validatedExemptionReason: ValidatedExemptionReason;
    exemptionReason: ValidatedExemptionReason;
    status: string;
    ecmStatus: string;
    createdDate: string;
    modifiedDate: string;
    taxNumberType: string;
    businessNumberType: string;
    pageCount: number;
    customers: Customer[];
    exposureZone: ExposureZone;
    ecmsId: number;
    ecmsStatus: string;
}
