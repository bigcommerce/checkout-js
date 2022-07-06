export default function mapFromInstrumentCardType(type: string): string {
    switch (type) {
    case 'amex':
    case 'american_express':
        return 'american-express';

    case 'diners':
        return 'diners-club';

    default:
        return type;
    }
}
