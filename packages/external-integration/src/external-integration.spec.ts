import { externalIntegration } from './external-integration';

describe('external', () => {
    it('should work', () => {
        expect(externalIntegration()).toBe('external-integration');
    });
});
