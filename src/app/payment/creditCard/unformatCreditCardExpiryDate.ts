export interface ExpiryDate {
    month: string;
    year: string;
}

export default function unformatCreditCardExpiryDate(value: string): ExpiryDate {
    const separator = '/';
    const [month = '', year = ''] = value.split(new RegExp(`\\s*${separator}\\s*`));

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
        return { month: '', year: '' };
    }

    return {
        month: month.length === 1 ? `0${month}` : month.slice(0, 2),
        year: year.length === 2 ? `20${year}` : year.slice(0, 4),
    };
}
