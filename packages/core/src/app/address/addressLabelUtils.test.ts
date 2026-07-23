import {
    type Address,
    type AddressRequestBody,
    type CustomerAddress,
} from '@bigcommerce/checkout-sdk';

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

    it('derives the label from company and ignores b2b.label', () => {
        const address = {
            company: 'HQ/ Acme Corp',
            b2b: { label: 'Different' },
        } as CustomerAddress;

        expect(decodeAddressLabel(address, true)).toMatchObject({
            label: 'HQ',
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
});
