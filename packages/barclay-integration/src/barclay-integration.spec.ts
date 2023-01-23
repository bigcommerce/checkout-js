import { barclayIntegration } from './barclay-integration';

describe('external', () => {
    it('should work', () => {
        expect(barclayIntegration()).toBe('barclay-integration');
    });
});
