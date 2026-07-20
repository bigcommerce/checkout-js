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
    it('splits a label out of company when no b2b label is present', () => {
        const address = { company: 'Acme/ Acme Corp' } as Address;

        expect(decodeAddressLabel(address)).toMatchObject({
            label: 'Acme',
            company: 'Acme Corp',
        });
    });

    it('prefers b2b.label over a company-embedded label', () => {
        const address = {
            company: 'Acme Corp',
            b2b: { label: 'HQ' },
        } as CustomerAddress;

        expect(decodeAddressLabel(address)).toMatchObject({
            label: 'HQ',
            company: 'Acme Corp',
        });
    });

    it('is idempotent when called twice, even without a b2b label', () => {
        const address = { company: 'Acme/ Acme Corp' } as Address;

        const decodedOnce = decodeAddressLabel(address);
        const decodedTwice = decodeAddressLabel(decodedOnce);

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

        const selected = decodeAddressLabel(raw);
        const reDecoded = decodeAddressLabel(selected);
        const encoded = encodeAddressForWrite(reDecoded);

        expect(encoded.company).toBe(joinLabelAndCompany('Acme', 'Acme Corp'));
    });
});
