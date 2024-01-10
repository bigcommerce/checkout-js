export interface BlueSnapDirectInitializationData {
    sepaCreditorCompanyName: string;
    idealIssuers: IdealIssuer[];
}

interface IdealIssuer {
    issuerId: string;
    issuerName: string;
}

export const isBlueSnapDirectIdealIssuerList = (array: unknown): array is IdealIssuer[] => {
    if (
        !(
            Array.isArray(array) &&
            array.length &&
            'issuerId' in array[0] &&
            'issuerName' in array[0]
        )
    ) {
        return false;
    }

    return true;
};

export const isBlueSnapDirectInitializationData = (
    object: unknown,
): object is BlueSnapDirectInitializationData => {
    if (
        !(
            typeof object === 'object' &&
            object !== null &&
            (('sepaCreditorCompanyName' in object &&
                typeof object.sepaCreditorCompanyName === 'string') ||
                ('idealIssuers' in object && isBlueSnapDirectIdealIssuerList(object.idealIssuers)))
        )
    ) {
        return false;
    }

    return true;
};
