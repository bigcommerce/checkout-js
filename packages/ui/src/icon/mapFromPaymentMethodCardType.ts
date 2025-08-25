import { type ComponentType, lazy } from 'react';

import { type IconProps } from './';

interface InstrumentComponent {
    instrument: string;
    component: ComponentType<IconProps>;
}

const instrumentTypeMap: Record<string, InstrumentComponent> = {
    AMEX: {
        instrument: 'american-express',
        component: lazy(() => import(/* webpackChunkName: "icon-card-amex" */ './IconCardAmex')),
    },
    BITCOIN: {
        instrument: 'bitcoin',
        component: lazy(() => import(/* webpackChunkName: "icon-bitcoin" */ './IconBitCoin')),
    },
    BITCOIN_CASH: {
        instrument: 'bitcoin-cash',
        component: lazy(
            () => import(/* webpackChunkName: "icon-bitcoin-cash" */ './IconBitCoinCash'),
        ),
    },
    BANCONTACT: {
        instrument: 'bancontact',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-bancontact" */ './IconCardBancontact'),
        ),
    },
    CARNET: {
        instrument: 'carnet',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-carnet" */ './IconCardCarnet'),
        ),
    },
    CB: {
        instrument: 'cb',
        component: lazy(() => import(/* webpackChunkName: "icon-card-cb" */ './IconCardCB')),
    },
    DINERS: {
        instrument: 'diners-club',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-diners-club" */ './IconCardDinersClub'),
        ),
    },
    DANKORT: {
        instrument: 'dankort',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-dankort" */ './IconCardDankort'),
        ),
    },
    DISCOVER: {
        instrument: 'discover',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-discover" */ './IconCardDiscover'),
        ),
    },
    DOGECOIN: {
        instrument: 'dogecoin',
        component: lazy(() => import(/* webpackChunkName: "icon-dogecoin" */ './IconDogeCoin')),
    },
    ELECTRON: {
        instrument: 'electron',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-electron" */ './IconCardElectron'),
        ),
    },
    ELO: {
        instrument: 'elo',
        component: lazy(() => import(/* webpackChunkName: "icon-card-elo" */ './IconCardElo')),
    },
    ETHEREUM: {
        instrument: 'ethereum',
        component: lazy(() => import(/* webpackChunkName: "icon-ethereum" */ './IconEthereum')),
    },
    HIPER: {
        instrument: 'hiper',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-hipercard" */ './IconCardHipercard'),
        ),
    },
    JCB: {
        instrument: 'jcb',
        component: lazy(() => import(/* webpackChunkName: "icon-card-jcb" */ './IconCardJCB')),
    },
    LITECOIN: {
        instrument: 'litecoin',
        component: lazy(() => import(/* webpackChunkName: "icon-litecoin" */ './IconLiteCoin')),
    },
    MADA: {
        instrument: 'mada',
        component: lazy(() => import(/* webpackChunkName: "icon-card-mada" */ './IconCardMada')),
    },
    MAESTRO: {
        instrument: 'maestro',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-maestro" */ './IconCardMaestro'),
        ),
    },
    MC: {
        instrument: 'mastercard',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-mastercard" */ './IconCardMastercard'),
        ),
    },
    SHIBA_INU: {
        instrument: 'shiba-inu',
        component: lazy(() => import(/* webpackChunkName: "icon-shiba-inu" */ './IconShibaInu')),
    },
    TROY: {
        instrument: 'troy',
        component: lazy(() => import(/* webpackChunkName: "icon-card-troy" */ './IconCardTroy')),
    },
    CUP: {
        instrument: 'unionpay',
        component: lazy(
            () => import(/* webpackChunkName: "icon-card-unionpay" */ './IconCardUnionPay'),
        ),
    },
    USD_COIN: {
        instrument: 'usd-coin',
        component: lazy(() => import(/* webpackChunkName: "icon-usd-coin" */ './IconUsdCoin')),
    },
    VISA: {
        instrument: 'visa',
        component: lazy(() => import(/* webpackChunkName: "icon-card-visa" */ './IconCardVisa')),
    },
};

export default function mapFromPaymentMethodCardType(type: string): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return instrumentTypeMap[type]?.instrument || undefined;
}

export function getPaymentMethodIconComponent(type?: string): ComponentType<IconProps> | undefined {
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

    return instrumentTypes.filter((type) => supportedInstrumentTypes.includes(type));
}
