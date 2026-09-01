import { restoreStreetNumberSuffix } from './utils';

describe('restoreStreetNumberSuffix()', () => {
    it('restores a letter suffix dropped by place details, upper-cased per Australia Post', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34a Bayford Street')).toBe(
            '34A Bayford Street',
        );
    });

    it('restores a letter suffix while keeping the long route name from place details', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34a Bayford St')).toBe(
            '34A Bayford Street',
        );
    });

    it('restores a letter suffix on a subpremise street number', () => {
        expect(restoreStreetNumberSuffix('2/34 Bayford Street', '2/34a Bayford St')).toBe(
            '2/34A Bayford Street',
        );
    });

    it('returns the street unchanged when the prediction has a "unit" prefix and no extra suffix', () => {
        expect(restoreStreetNumberSuffix('4/28 Beach Street', 'unit 4/28 Beach Street')).toBe(
            '4/28 Beach Street',
        );
    });

    it('restores a letter suffix when the prediction has a "unit" prefix', () => {
        expect(restoreStreetNumberSuffix('4/28 Beach Street', 'unit 4/28a Beach St')).toBe(
            '4/28A Beach Street',
        );
    });

    it('restores a letter suffix when the subpremise contains a space', () => {
        expect(restoreStreetNumberSuffix('shop 2/34 Bayford Street', 'shop 2/34a Bayford St')).toBe(
            'shop 2/34A Bayford Street',
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

    it('returns the street unchanged when the suffix is longer than a single letter', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34ab Bayford St')).toBe(
            '34 Bayford Street',
        );
        expect(restoreStreetNumberSuffix('34 Bayford Street', '34abc Bayford St')).toBe(
            '34 Bayford Street',
        );
    });

    it('returns the street unchanged when the prediction number is an ordinal', () => {
        expect(restoreStreetNumberSuffix('34 34th Avenue', '34th Avenue')).toBe('34 34th Avenue');
    });

    it('returns the street unchanged when no prediction text is provided', () => {
        expect(restoreStreetNumberSuffix('34 Bayford Street')).toBe('34 Bayford Street');
        expect(restoreStreetNumberSuffix('34 Bayford Street', '')).toBe('34 Bayford Street');
    });
});
