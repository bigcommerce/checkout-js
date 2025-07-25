import { ComponentType, lazy } from 'react';

import type { IconProps } from '@bigcommerce/checkout/ui';

interface InstrumentComponent {
    instrument: string;
    component: ComponentType<IconProps>;
}

const instrumentTypeMap: Record<string, InstrumentComponent> = {
    AMEX: {
        instrument: 'american-express',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-amex" */ '@bigcommerce/checkout/ui/icon/IconCardAmex'
                ),
        ),
    },
    BITCOIN: {
        instrument: 'bitcoin',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-bitcoin" */ '@bigcommerce/checkout/ui/icon/IconBitCoin'
                ),
        ),
    },
    BITCOIN_CASH: {
        instrument: 'bitcoin-cash',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-bitcoin-cash" */ '@bigcommerce/checkout/ui/icon/IconBitCoinCash'
                ),
        ),
    },
    BANCONTACT: {
        instrument: 'bancontact',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-bancontact" */ '@bigcommerce/checkout/ui/icon/IconCardBancontact'
                ),
        ),
    },
    CARNET: {
        instrument: 'carnet',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-carnet" */ '@bigcommerce/checkout/ui/icon/IconCardCarnet'
                ),
        ),
    },
    CB: {
        instrument: 'cb',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-cb" */ '@bigcommerce/checkout/ui/icon/IconCardCB'
                ),
        ),
    },
    DINERS: {
        instrument: 'diners-club',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-diners-club" */ '@bigcommerce/checkout/ui/icon/IconCardDinersClub'
                ),
        ),
    },
    DANKORT: {
        instrument: 'dankort',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-dankort" */ '@bigcommerce/checkout/ui/icon/IconCardDankort'
                ),
        ),
    },
    DISCOVER: {
        instrument: 'discover',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-discover" */ '@bigcommerce/checkout/ui/icon/IconCardDiscover'
                ),
        ),
    },
    DOGECOIN: {
        instrument: 'dogecoin',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-dogecoin" */ '@bigcommerce/checkout/ui/icon/IconDogeCoin'
                ),
        ),
    },
    ELECTRON: {
        instrument: 'electron',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-electron" */ '@bigcommerce/checkout/ui/icon/IconCardElectron'
                ),
        ),
    },
    ELO: {
        instrument: 'elo',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-elo" */ '@bigcommerce/checkout/ui/icon/IconCardElo'
                ),
        ),
    },
    ETHEREUM: {
        instrument: 'ethereum',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-ethereum" */ '@bigcommerce/checkout/ui/icon/IconEthereum'
                ),
        ),
    },
    HIPER: {
        instrument: 'hiper',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-hipercard" */ '@bigcommerce/checkout/ui/icon/IconCardHipercard'
                ),
        ),
    },
    JCB: {
        instrument: 'jcb',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-jcb" */ '@bigcommerce/checkout/ui/icon/IconCardJCB'
                ),
        ),
    },
    LITECOIN: {
        instrument: 'litecoin',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-litecoin" */ '@bigcommerce/checkout/ui/icon/IconLiteCoin'
                ),
        ),
    },
    MADA: {
        instrument: 'mada',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-mada" */ '@bigcommerce/checkout/ui/icon/IconCardMada'
                ),
        ),
    },
    MAESTRO: {
        instrument: 'maestro',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-maestro" */ '@bigcommerce/checkout/ui/icon/IconCardMaestro'
                ),
        ),
    },
    MC: {
        instrument: 'mastercard',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-mastercard" */ '@bigcommerce/checkout/ui/icon/IconCardMastercard'
                ),
        ),
    },
    SHIBA_INU: {
        instrument: 'shiba-inu',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-shiba-inu" */ '@bigcommerce/checkout/ui/icon/IconShibaInu'
                ),
        ),
    },
    TROY: {
        instrument: 'troy',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-troy" */ '@bigcommerce/checkout/ui/icon/IconCardTroy'
                ),
        ),
    },
    CUP: {
        instrument: 'unionpay',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-unionpay" */ '@bigcommerce/checkout/ui/icon/IconCardUnionPay'
                ),
        ),
    },
    USD_COIN: {
        instrument: 'usd-coin',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-usd-coin" */ '@bigcommerce/checkout/ui/icon/IconUsdCoin'
                ),
        ),
    },
    VISA: {
        instrument: 'visa',
        component: lazy(
            () =>
                import(
                    /* webpackChunkName: "icon-card-visa" */ '@bigcommerce/checkout/ui/icon/IconCardVisa'
                ),
        ),
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

    return instrumentTypes.filter((type) => supportedInstrumentTypes.includes(type));
}
