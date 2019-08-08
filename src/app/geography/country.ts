export default interface Country {
    code: string;
    name: string;
    hasPostalCodes: boolean;
    subdivisions: Region[];
}

export interface Region {
    code: string;
    name: string;
}

export interface LocalizedGeography {
    localizedCountry: string;
    localizedProvince: string;
}
