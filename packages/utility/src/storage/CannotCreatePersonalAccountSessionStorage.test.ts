import { CannotCreatePersonalAccountSessionStorage } from './CannotCreatePersonalAccountSessionStorage';

describe('CannotCreatePersonalAccountSessionStorage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('returns false when nothing is stored', () => {
        expect(CannotCreatePersonalAccountSessionStorage.getCannotCreatePersonalAccount()).toBe(
            false,
        );
    });

    it('round-trips a stored true value', () => {
        CannotCreatePersonalAccountSessionStorage.setCannotCreatePersonalAccount(true);

        expect(sessionStorage.getItem(CannotCreatePersonalAccountSessionStorage.key)).toBe('true');
        expect(CannotCreatePersonalAccountSessionStorage.getCannotCreatePersonalAccount()).toBe(
            true,
        );
    });

    it('round-trips a stored false value', () => {
        CannotCreatePersonalAccountSessionStorage.setCannotCreatePersonalAccount(false);

        expect(sessionStorage.getItem(CannotCreatePersonalAccountSessionStorage.key)).toBe('false');
        expect(CannotCreatePersonalAccountSessionStorage.getCannotCreatePersonalAccount()).toBe(
            false,
        );
    });

    it('removes the stored value', () => {
        CannotCreatePersonalAccountSessionStorage.setCannotCreatePersonalAccount(true);

        CannotCreatePersonalAccountSessionStorage.removeCannotCreatePersonalAccount();

        expect(sessionStorage.getItem(CannotCreatePersonalAccountSessionStorage.key)).toBeNull();
        expect(CannotCreatePersonalAccountSessionStorage.getCannotCreatePersonalAccount()).toBe(
            false,
        );
    });
});
