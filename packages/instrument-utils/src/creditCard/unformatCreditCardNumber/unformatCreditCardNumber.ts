import { number } from 'card-validator';

export default function unformatCreditCardNumber(value: string, separator = ' '): string {
    const { card } = number(value);

    if (!card) {
        return value;
    }

    return value.replace(new RegExp(separator, 'g'), '');
}
