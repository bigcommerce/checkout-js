export default function mapFromPaymentMethodCardType(type: string): string | undefined {
    switch (type) {
    case 'AMEX':
        return 'american-express';

    case 'CB':
        return 'cb';

    case 'DINERS':
        return 'diners-club';

    case 'DISCOVER':
        return 'discover';

    case 'JCB':
        return 'jcb';

    case 'MADA':
        return 'mada';

    case 'MAESTRO':
        return 'maestro';

    case 'MC':
        return 'mastercard';

    case 'CUP':
        return 'unionpay';

    case 'VISA':
        return 'visa';

    default:
        return undefined;
    }
}
