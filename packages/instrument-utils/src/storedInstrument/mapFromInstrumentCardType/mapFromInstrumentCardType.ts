export default function mapFromInstrumentCardType(type: string): string {
    switch (type) {
        case 'amex':
        case 'american_express':
            return 'american-express';

        case 'diners':
        case 'diners_club':
            return 'diners-club';

        default:
            return type;
    }
}
