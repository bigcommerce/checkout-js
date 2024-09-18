import { SubscribeSessionStorage } from "./SubscribeSessionStorage";

describe('SubscribeSessionStorage', () => {
    it('sets, gets and removes subscribe status successfully', () => {
        expect(SubscribeSessionStorage.getSubscribeStatus()).toBe(false);
        SubscribeSessionStorage.setSubscribeStatus(true);

        expect(SubscribeSessionStorage.getSubscribeStatus()).toBe(true);

        SubscribeSessionStorage.removeSubscribeStatus();
        expect(SubscribeSessionStorage.getSubscribeStatus()).toBe(false);
    });
});
