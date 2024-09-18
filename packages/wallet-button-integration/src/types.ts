export interface WalletButtonInitializationDataCardData {
    accountMask: string;
    cardType: string;
    expMonth: string;
    expYear: string;
}

export interface WalletButtonInitializationDataCardInformation {
    number: string;
    type: string;
}

export interface WalletButtonInitializationData {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    card_information?: WalletButtonInitializationDataCardInformation;
    cardData?: WalletButtonInitializationDataCardData;
    accountNum?: string;
    accountMask?: string;
    expDate?: string;
}
