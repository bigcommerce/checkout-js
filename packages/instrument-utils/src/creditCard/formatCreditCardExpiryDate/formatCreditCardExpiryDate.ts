export default function formatCreditCardExpiryDate(value: string): string {
    const separator = '/';
    const [month = '', year = ''] = value.split(new RegExp(`\\s*${separator}\\s*`));
    const trimmedMonth = month.slice(0, 2);
    const trimmedYear =
        year.length === 4 ? year.slice(-2) : year ? year.slice(0, 2) : month.slice(2);

    // i.e.: '1'
    if (value.length < 2) {
        return month;
    }

    // ie.: '10 /' (without trailing space)
    if (value.length > 3 && !trimmedYear) {
        return trimmedMonth;
    }

    return `${trimmedMonth} / ${trimmedYear}`;
}
