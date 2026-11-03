const getNonce = (initializationData: unknown): string | undefined => {
    if (
        typeof initializationData === 'object' &&
        initializationData !== null &&
        'nonce' in initializationData &&
        typeof initializationData.nonce === 'string'
    ) {
        return initializationData.nonce;
    }

    return undefined;
};

export default getNonce;
