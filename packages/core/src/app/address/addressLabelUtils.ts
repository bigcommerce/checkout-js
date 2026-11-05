import { type Address, type AddressRequestBody } from '@bigcommerce/checkout-sdk';

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

function stripLabel(company: string | undefined, label: string): string {
    const prefix = `${label}${DELIMITER}`;

    return label && company?.startsWith(prefix)
        ? company.substring(prefix.length)
        : (company ?? '');
}

export function joinLabelAndCompany(label: string, company: string): string {
    return label ? `${label}${DELIMITER}${company}` : company;
}

function splitCompanyLabel<T extends Address>(address: T): T {
    const { company, label } = address;

    if (label !== undefined) {
        return { ...address, company: stripLabel(company, label) };
    }

    return {
        ...address,
        label: parseLabel(company),
        company: parseCompany(company),
    };
}

/** READ boundary: when the capability is on, split `company` into a plain company + separate
 * `label` (idempotent); otherwise pass the address through untouched. */
export function decodeAddressLabel<T extends Address | undefined>(
    address: T,
    hasAddressLabel: boolean,
): T {
    return hasAddressLabel && address ? splitCompanyLabel(address) : address;
}

/** WRITE boundary: fold `label` back into `company` for the BC API and drop it. Idempotent. */
export function encodeAddressForWrite<T extends Partial<AddressRequestBody>>(address: T): T {
    const { label, ...rest } = address;

    if (label === undefined) {
        return { ...(rest as T), company: address.company ?? '' };
    }

    return {
        ...(rest as T),
        company: joinLabelAndCompany(label, stripLabel(address.company, label)),
    };
}
