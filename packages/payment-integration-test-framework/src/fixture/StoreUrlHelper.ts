export const getStoreUrl = (): string => {
    const mode = process.env.MODE?.toLowerCase();

    if (mode === 'replay') {
        return '';
    }

    const storeUrl = process.env.STOREURL;

    if (!storeUrl) {
        throw new Error('STOREURL is undefined. Please set STOREURL environment variable.');
    }

    const url = new URL(storeUrl);

    return `${url.protocol}//${url.host}`;
};
