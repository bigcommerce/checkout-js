import computeErrorCode from './computeErrorCode';

describe('computerErrorCode()', () => {
    it('returns error code by hashing input', () => {
        expect(computeErrorCode(new Error('Testing 123'))).toBe(
            'F9516497646215C5AF995E0B797FE138FA29ECBA',
        );

        expect(computeErrorCode('Testing 123')).toBe('2387ED48D743D74DD80D8D363692817FC8A36AAA');

        expect(computeErrorCode({ error: 'Testing 123' })).toBe(
            '57DD26761A556285AEC130DC14E581CB5D411329',
        );
    });

    it('returns empty string if unable to compute error code', () => {
        expect(computeErrorCode(new Event('click'))).toBeUndefined();

        expect(computeErrorCode(new DOMException('Testing 123'))).toBeUndefined();
    });
});
