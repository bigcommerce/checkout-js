import { restoreStreetNumberSuffix } from './utils';

describe('restoreStreetNumberSuffix()', () => {
    it('restores a letter suffix dropped by place details', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34a Bayford Street')).toBe(
            '34a Bayford Street',
        );
    });

    it('restores a letter suffix while keeping the long route name from place details', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34a Bayford St')).toBe(
            '34a Bayford Street',
        );
    });

    it('restores a letter suffix on a subpremise street number', () => {
        expect(restoreStreetNumberSuffix('2/34 Bayford Street', '2/34a Bayford St')).toBe(
            '2/34a Bayford Street',
        );
    });

    it('returns the street unchanged when the street numbers already match', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34 Bayford St')).toBe(
            '34 Bayford Street',
        );
    });

    it('returns the street unchanged when the prediction number does not extend the street number', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '345 Bayford St')).toBe(
            '34 Bayford Street',
        );
        expect(restoreStreetNumberSuffix('34 Bayford Street', '12a Bayford St')).toBe(
            '34 Bayford Street',
        );
    });

    it('returns the street unchanged when the suffix is longer than two letters', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34abc Bayford St')).toBe(
            '34 Bayford Street',
        );
    });

    it('returns the street unchanged when no prediction text is provided', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street')).toBe('34 Bayford Street');
        expect(restoreStreetNumberSuffix('34 Bayford Street', '')).toBe('34 Bayford Street');
    });
});
