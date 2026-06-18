import { type SelectedCountryData } from 'intl-tel-input';

export const getPhoneNumberPlaceholder = (
    exampleNumber: string,
    selectedCountryData: SelectedCountryData,
): string => {
    if (!exampleNumber || !selectedCountryData) return '';

    return `e.g. ${exampleNumber}`;
};
