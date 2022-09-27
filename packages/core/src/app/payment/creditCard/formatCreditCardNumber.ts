import { number } from 'card-validator';

import unformatCreditCardNumber from './unformatCreditCardNumber';

export default function formatCreditCardNumber(value: string, separator = ' '): string {
    const { card } = number(value);

    if (!card) {
        return value;
    }

    const unformattedValue = unformatCreditCardNumber(value, separator);

    return card.gaps
        .filter((gapIndex) => unformattedValue.length > gapIndex)
        .reduce(
            (output, gapIndex, index) =>
                [output.slice(0, gapIndex + index), output.slice(gapIndex + index)].join(separator),
            unformattedValue,
        );
}
