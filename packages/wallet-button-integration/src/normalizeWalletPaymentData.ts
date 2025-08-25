import { number } from 'card-validator';

import { type WalletButtonInitializationData } from './types';

interface WalletPaymentData {
    accountMask: string;
    cardType: string;
    expiryMonth?: string;
    expiryYear?: string;
}

const formatAccountMask = (accountMask = '', padding = '****'): string =>
    accountMask.includes('*') ? accountMask : `${padding} ${accountMask}`;

const isWalletButtonInitializationData = (
    object: unknown,
): object is WalletButtonInitializationData => {
    if (typeof object === 'object' && object !== null) {
        if (
            'card_information' in object &&
            typeof object.card_information === 'object' &&
            object.card_information !== null &&
            'number' in object.card_information &&
            'type' in object.card_information
        ) {
            return true;
        }

        if (
            'cardData' in object &&
            typeof object.cardData === 'object' &&
            object.cardData !== null &&
            'accountMask' in object.cardData &&
            'cardType' in object.cardData &&
            'expMonth' in object.cardData &&
            'expYear' in object.cardData
        ) {
            return true;
        }

        if ('accountNum' in object && 'accountMask' in object && 'expDate' in object) {
            return true;
        }
    }

    return false;
};

// For some odd reason, `initializationData` is a schema-less object. So in
// order to use it safely, we have to normalize it first.
const normalizeWalletPaymentData = (data: unknown): WalletPaymentData | undefined => {
    if (isWalletButtonInitializationData(data)) {
        if (data.card_information) {
            return {
                accountMask: formatAccountMask(data.card_information.number),
                cardType: data.card_information.type,
            };
        }

        if (data.cardData) {
            return {
                accountMask: formatAccountMask(data.cardData.accountMask),
                cardType: data.cardData.cardType,
                expiryMonth: data.cardData.expMonth,
                expiryYear: data.cardData.expYear,
            };
        }

        if (data.accountNum) {
            const { card } = number(data.accountNum);

            return {
                accountMask: formatAccountMask(data.accountMask),
                expiryMonth: data.expDate && data.expDate.substr(0, 2),
                expiryYear: data.expDate && data.expDate.substr(2, 2),
                cardType: card ? card.niceType : '',
            };
        }
    }

    return undefined;
};

export default normalizeWalletPaymentData;
