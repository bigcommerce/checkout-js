const KEY = 'PoNumber';

export const getPoNumber = (): string => sessionStorage.getItem(KEY) ?? '';

export const setPoNumber = (value: string): void => {
    if (value) {
        sessionStorage.setItem(KEY, value);
    } else {
        sessionStorage.removeItem(KEY);
    }
};

export const clearPoNumber = (): void => sessionStorage.removeItem(KEY);
