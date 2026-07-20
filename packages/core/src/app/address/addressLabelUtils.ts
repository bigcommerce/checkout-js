import {
    type Address,
    type AddressRequestBody,
    type CustomerAddress,
} from '@bigcommerce/checkout-sdk';

// A B2B address label is transported inside the `company` field as "{label}/ {company}", because
// the BC API ignores a standalone label field on write.
const DELIMITER = '/ ';

function parseLabel(company: string | undefined): string {
    return company && company.includes(DELIMITER)
        ? company.substring(0, company.indexOf(DELIMITER))
        : '';
}

function parseCompany(company: string | undefined): string {
    return company && company.includes(DELIMITER)
        ? company.substring(company.indexOf(DELIMITER) + DELIMITER.length)
        : (company ?? '');
}

export function joinLabelAndCompany(label: string, company: string): string {
    return label ? `${label}${DELIMITER}${company}` : company;
}

/** READ boundary: split `company` into a plain company + separate `label`. Idempotent. */
export function decodeAddressLabel<T extends Address | CustomerAddress>(address: T): T {
    return {
        ...address,
        label: (address as CustomerAddress).b2b?.label || parseLabel(address.company),
        company: parseCompany(address.company),
    };
}

/** WRITE boundary: fold `label` back into `company` for the BC API and drop it. Idempotent. */
export function encodeAddressForWrite<T extends AddressRequestBody>(address: T): T {
    const label = address.label || parseLabel(address.company);
    const { label: _label, ...rest } = address;

    return { ...(rest as T), company: joinLabelAndCompany(label, parseCompany(address.company)) };
}
