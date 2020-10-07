export default function mapFromPaymentMethodCardType(type: string): string | undefined {
    switch (type) {
    case 'AMEX':
        return 'american-express';

    case 'CARNET':
        return 'carnet';

    case 'CB':
        return 'cb';

    case 'DINERS':
        return 'diners-club';

    case 'DANKORT':
        return 'dankort';

    case 'DISCOVER':
        return 'discover';

    case 'ELO':
        return 'elo';

    case 'HIPER':
        return 'hiper';

    case 'JCB':
        return 'jcb';

    case 'MADA':
        return 'mada';

    case 'MAESTRO':
        return 'maestro';

    case 'MC':
        return 'mastercard';

    case 'TROY':
        return 'troy';

    case 'CUP':
        return 'unionpay';

    case 'VISA':
        return 'visa';

    default:
        return undefined;
    }
}
