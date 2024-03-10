export class SubscribeSessionStorage {
    static key = 'shouldSubscribe';

    static setSubscribeStatus(shouldSubscribe: boolean) {
        sessionStorage.setItem(this.key, `${shouldSubscribe}`)
    }

    static getSubscribeStatus(): boolean {
        const value = sessionStorage.getItem(this.key);

        return value === 'true';
    }

    static removeSubscribeStatus() {
        sessionStorage.removeItem(this.key);
    }
}
