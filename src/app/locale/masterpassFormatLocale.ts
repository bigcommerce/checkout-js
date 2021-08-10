export default function masterpassFormatLocale(localeLanguage: string): string {
    return localeLanguage.replace('-', '_').toLowerCase();
}
