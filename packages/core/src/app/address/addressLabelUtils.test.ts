import { type Address, type AddressRequestBody } from '@bigcommerce/checkout-sdk';

import {
    decodeAddressLabel,
    encodeAddressForWrite,
    joinLabelAndCompany,
} from './addressLabelUtils';

describe('decodeAddressLabel', () => {
    it('splits the label out of company', () => {
        const address = { company: 'Acme/ Acme Corp' } as Address;

        expect(decodeAddressLabel(address, true)).toMatchObject({
            label: 'Acme',
            company: 'Acme Corp',
        });
    });

    it('passes the address through untouched when the capability is off', () => {
        const address = { company: 'Acme/ Acme Corp' } as Address;

        expect(decodeAddressLabel(address, false)).toBe(address);
    });

    it('is idempotent when called twice', () => {
        const address = { company: 'Acme/ Acme Corp' } as Address;

        const decodedOnce = decodeAddressLabel(address, true);
        const decodedTwice = decodeAddressLabel(decodedOnce, true);

        expect(decodedTwice).toMatchObject({
            label: 'Acme',
            company: 'Acme Corp',
        });
    });

    it('strips only the known label prefix when company name contains a slash', () => {
        const address = { label: 'HQ', company: 'HQ/ Smith/ Sons' } as Address;

        expect(decodeAddressLabel(address, true)).toMatchObject({
            label: 'HQ',
            company: 'Smith/ Sons',
        });
    });

    it('keeps a slash company name intact when called twice', () => {
        const address = { company: 'HQ/ Smith/ Sons' } as Address;

        const decodedOnce = decodeAddressLabel(address, true);
        const decodedTwice = decodeAddressLabel(decodedOnce, true);

        expect(decodedTwice).toMatchObject({
            label: 'HQ',
            company: 'Smith/ Sons',
        });
    });

    it('does not split company when label is empty', () => {
        const address = { label: '', company: 'Smith/ Sons' } as Address;

        expect(decodeAddressLabel(address, true)).toMatchObject({
            label: '',
            company: 'Smith/ Sons',
        });
    });
});

describe('encodeAddressForWrite', () => {
    it('folds label back into company and drops the label field', () => {
        const address = { label: 'Acme', company: 'Acme Corp' } as AddressRequestBody;

        const encoded = encodeAddressForWrite(address);

        expect(encoded).not.toHaveProperty('label');
        expect(encoded.company).toBe('Acme/ Acme Corp');
    });

    it('survives a decode -> select -> decode -> encode round trip without losing the label', () => {
        const raw = { company: 'Acme/ Acme Corp' } as Address;

        const selected = decodeAddressLabel(raw, true);
        const reDecoded = decodeAddressLabel(selected, true);
        const encoded = encodeAddressForWrite(reDecoded);

        expect(encoded.company).toBe(joinLabelAndCompany('Acme', 'Acme Corp'));
    });

    it('keeps a slash company name intact when folding the label back', () => {
        const address = { label: 'HQ', company: 'Smith/ Sons' } as AddressRequestBody;

        expect(encodeAddressForWrite(address).company).toBe('HQ/ Smith/ Sons');
    });

    it('does not duplicate the label when company is already encoded', () => {
        const address = { label: 'HQ', company: 'HQ/ Smith/ Sons' } as AddressRequestBody;

        expect(encodeAddressForWrite(address).company).toBe('HQ/ Smith/ Sons');
    });

    it('passes company through unchanged when there is no label', () => {
        const address = { company: 'Smith/ Sons' } as AddressRequestBody;

        const encoded = encodeAddressForWrite(address);

        expect(encoded).not.toHaveProperty('label');
        expect(encoded.company).toBe('Smith/ Sons');
    });

    it('survives a round trip when company name contains a slash', () => {
        const raw = { company: 'HQ/ Smith/ Sons' } as Address;

        const selected = decodeAddressLabel(raw, true);
        const reDecoded = decodeAddressLabel(selected, true);
        const encoded = encodeAddressForWrite(reDecoded);

        expect(encoded.company).toBe('HQ/ Smith/ Sons');
    });
});
