export class CannotCreatePersonalAccountSessionStorage {
    static readonly key = 'checkout_js_cannot_create_personal_account';

    static setCannotCreatePersonalAccount(cannotCreatePersonalAccount: boolean): void {
        sessionStorage.setItem(this.key, `${cannotCreatePersonalAccount}`);
    }

    static getCannotCreatePersonalAccount(): boolean {
        return sessionStorage.getItem(this.key) === 'true';
    }

    static removeCannotCreatePersonalAccount(): void {
        sessionStorage.removeItem(this.key);
    }
}
