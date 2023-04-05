import { ComponentType } from 'react';

import {
    IconBitCoin,
    IconBitCoinCash,
    IconCardAmex,
    IconCardBancontact,
    IconCardCarnet,
    IconCardCB,
    IconCardDankort,
    IconCardDinersClub,
    IconCardDiscover,
    IconCardElectron,
    IconCardElo,
    IconCardHipercard,
    IconCardJCB,
    IconCardMada,
    IconCardMaestro,
    IconCardMastercard,
    IconCardTroy,
    IconCardUnionPay,
    IconCardVisa,
    IconDogeCoin,
    IconEthereum,
    IconLiteCoin,
    IconProps,
    IconShibaInu,
    IconUsdCoin,
} from '../../ui/icon';

interface InstrumentComponent {
    instrument: string;
    component: ComponentType<IconProps>;
}

const instrumentTypeMap: Record<string, InstrumentComponent> = {
    AMEX: {
        instrument: 'american-express',
        component: IconCardAmex,
    },
    BITCOIN: {
        instrument: 'bitcoin',
        component: IconBitCoin,
    },
    BITCOIN_CASH: {
        instrument: 'bitcoin-cash',
        component: IconBitCoinCash,
    },
    BANCONTACT: {
        instrument: 'bancontact',
        component: IconCardBancontact,
    },
    CARNET: {
        instrument: 'carnet',
        component: IconCardCarnet,
    },
    CB: {
        instrument: 'cb',
        component: IconCardCB,
    },
    DINERS: {
        instrument: 'diners-club',
        component: IconCardDinersClub,
    },
    DANKORT: {
        instrument: 'dankort',
        component: IconCardDankort,
    },
    DISCOVER: {
        instrument: 'discover',
        component: IconCardDiscover,
    },
    DOGECOIN: {
        instrument: 'dogecoin',
        component: IconDogeCoin,
    },
    ELECTRON: {
        instrument: 'electron',
        component: IconCardElectron,
    },
    ELO: {
        instrument: 'elo',
        component: IconCardElo,
    },
    ETHEREUM: {
        instrument: 'ethereum',
        component: IconEthereum,
    },
    HIPER: {
        instrument: 'hiper',
        component: IconCardHipercard,
    },
    JCB: {
        instrument: 'jcb',
        component: IconCardJCB,
    },
    LITECOIN: {
        instrument: 'litecoin',
        component: IconLiteCoin,
    },
    MADA: {
        instrument: 'mada',
        component: IconCardMada,
    },
    MAESTRO: {
        instrument: 'maestro',
        component: IconCardMaestro,
    },
    MC: {
        instrument: 'mastercard',
        component: IconCardMastercard,
    },
    SHIBA_INU: {
        instrument: 'shiba-inu',
        component: IconShibaInu,
    },
    TROY: {
        instrument: 'troy',
        component: IconCardTroy,
    },
    CUP: {
        instrument: 'unionpay',
        component: IconCardUnionPay,
    },
    USD_COIN: {
        instrument: 'usd-coin',
        component: IconUsdCoin,
    },
    VISA: {
        instrument: 'visa',
        component: IconCardVisa,
    },
};

export default function mapFromPaymentMethodCardType(type: string): string | undefined {
    return instrumentTypeMap[type]?.instrument || undefined;
}

export function getPaymentMethodIconComponent(type?: string): ComponentType<any> | undefined {
    if (!type) {
        return undefined;
    }

    const instrumentType = Object.values(instrumentTypeMap).find(
        (record) => record.instrument === type,
    );

    return instrumentType ? instrumentType.component : undefined;
}

function getSupportedInstrumentTypes() {
    return Object.values(instrumentTypeMap).map((record) => record.instrument);
}

export function filterInstrumentTypes(instrumentTypes: string[]) {
    const supportedInstrumentTypes = getSupportedInstrumentTypes();

    return instrumentTypes.filter((type) => supportedInstrumentTypes.indexOf(type) !== -1);
}
