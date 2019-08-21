import { creditCardType } from 'card-validator';

export default function configureCardValidator(): void {
    const discoverInfo = creditCardType.getTypeInfo('discover');
    const visaInfo = creditCardType.getTypeInfo('visa');

    // Need to support 13 digit PAN because some gateways only provide test credit card numbers in this format.
    creditCardType.updateCard('visa', {
        lengths: [13, ...(visaInfo.lengths || [])],
    });

    // Add support for 8-BIN Discover Cards.
    creditCardType.updateCard('discover', {
        patterns: [
            ...(discoverInfo.patterns || []),
            [810, 817],
        ],
    });
}
