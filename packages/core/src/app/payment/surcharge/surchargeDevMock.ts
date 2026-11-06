/* eslint-disable */
/**
 * DEV-ONLY mock of the surcharging backend, used until the backend implements it.
 * Scope: what happens BEFORE Place order. Nothing about the payment itself is mocked.
 */
import { isSurchargeFee, isValidPfToken } from './surchargeContract';

const FLAG_KEY = 'surchargeMock';
const FEE_KEY = '__surchargeMockFee';

interface MockFee {
    id: string;
    type: string;
    name: string;
    displayName: string;
    customerDisplayName: string;
    cost: number;
    source: string;
}

const config = {
    // Surcharge endpoint: force the answer, set the rate, delay the answer. 'auto' decides by pfToken.
    mode: 'auto' as 'auto' | 'none' | 'error',
    rate: 3,
    delayMs: 2000,
};

const read = (key: string, storage: Storage): string | null => {
    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
};

const readFee = (): MockFee | null => {
    try {
        return JSON.parse(read(FEE_KEY, sessionStorage) || 'null');
    } catch {
        return null;
    }
};

const writeFee = (fee: MockFee | null) => {
    try {
        if (fee) sessionStorage.setItem(FEE_KEY, JSON.stringify(fee));
        else sessionStorage.removeItem(FEE_KEY);
    } catch {
        /* ignore */
    }
};

export const ensureSurchargeDevMockInstalled = (): void => installXhrMock();

export function isSurchargeDevMockEnabled(): boolean {
    if (process.env.NODE_ENV !== 'development') {
        return false;
    }

    try {
        const fromUrl = new URLSearchParams(window.location.search).get(FLAG_KEY);

        if (fromUrl === '1' || fromUrl === '0') {
            localStorage.setItem(FLAG_KEY, fromUrl);
        }
    } catch {
        /* ignore */
    }

    return read(FLAG_KEY, localStorage) === '1';
}

const note = (message: string, extra?: unknown) =>
    console.info(`%c[surcharge-mock] ${message}`, 'color:#b45309', extra ?? '');

let installed = false;

const ALLOWED_KEYS = ['paymentMethod', 'pfToken'];

// The backend side of the surcharge endpoint. Reads the checkout like the real backend would, instead of
// trusting an amount from the request.
function answerSurcharge(
    xhr: any,
    checkoutId: string,
    rawBody: unknown,
    respond: (xhr: any, status: number, body: unknown, delayMs?: number) => void,
) {
    const delay = config.delayMs;
    let request: any;

    try {
        request = JSON.parse(String(rawBody));
    } catch {
        request = undefined;
    }

    const extraKeys =
        request && typeof request === 'object'
            ? Object.keys(request).filter((key) => !ALLOWED_KEYS.includes(key))
            : [];

    if (
        !request ||
        extraKeys.length > 0 ||
        !isValidPfToken(request.pfToken) ||
        !request.paymentMethod?.id
    ) {
        note('POST /surcharge -> 422 (only paymentMethod and a pfToken are allowed)', {
            body: rawBody,
            extraKeys,
        });
        respond(xhr, 422, { title: 'Only paymentMethod and a pfToken are accepted' }, 150);

        return;
    }

    note('POST /surcharge', request);

    if (config.mode === 'error' || request.pfToken === 'error') {
        respond(xhr, 500, { title: 'mocked surcharge calculation error' }, delay);

        return;
    }

    fetch(`/api/storefront/checkout/${encodeURIComponent(checkoutId)}`, {
        credentials: 'include',
        headers: { Accept: 'application/vnd.bc.v1+json' },
    })
        .then((response) => response.json())
        .then((checkout: any) => {
            // The amount to surcharge: what is still to pay, without a surcharge that is already on it.
            const alreadySurcharged = (checkout.fees || [])
                .filter(isSurchargeFee)
                .reduce((sum: number, fee: { cost: number }) => sum + fee.cost, 0);
            const base =
                (checkout.outstandingBalance ?? checkout.grandTotal ?? 0) - alreadySurcharged;
            const rate = config.rate;
            const notEligible = config.mode === 'none' || request.pfToken === 'not-eligible';
            const amount = notEligible ? 0 : Math.round(base * rate) / 100;
            const answer = {
                eligible: !notEligible,
                amount,
                currency: checkout.cart?.currency?.code,
                rate: notEligible ? undefined : rate,
                legalText: notEligible
                    ? undefined
                    : `We impose a surcharge of ${rate.toFixed(
                          1,
                      )}% on the total transaction amount for this credit card, which is not greater than our cost of acceptance.`,
            };

            // What the real backend would do: the surcharge becomes a fee on the checkout.
            writeFee(
                notEligible || amount <= 0
                    ? null
                    : {
                          id: 'mock-fee-1',
                          type: 'custom_fee',
                          name: 'card_surcharge',
                          displayName: 'Surcharge',
                          customerDisplayName: 'Surcharge',
                          cost: amount,
                          source: 'payment_surcharge',
                      },
            );

            note('POST /surcharge -> 200', { base, ...answer });
            respond(xhr, 200, answer, delay);
        })
        .catch((error) => {
            note('POST /surcharge -> 500 (could not read the checkout)', error);
            respond(xhr, 500, { title: 'mocked backend could not read the checkout' }, delay);
        });
}

function installXhrMock() {
    if (installed) {
        return;
    }

    installed = true;

    // Start every page load from "no surcharge yet". A fee left over from an earlier run would make
    // the mock think the surcharge was already applied, while the real checkout has no such fee.
    writeFee(null);

    const proto = XMLHttpRequest.prototype;
    const origOpen = proto.open;
    const origSend = proto.send;
    const origResponseText = Object.getOwnPropertyDescriptor(proto, 'responseText');
    const origResponse = Object.getOwnPropertyDescriptor(proto, 'response');

    const withFee = (raw: string): string => {
        const fee = readFee();

        if (!fee) {
            return raw;
        }

        try {
            const data = JSON.parse(raw);

            data.fees = (data.fees || []).filter((f: MockFee) => f.id !== fee.id).concat([fee]);
            data.grandTotal = Math.round(((data.grandTotal || 0) + fee.cost) * 100) / 100;

            // The order summary and the Pay button read the total from `outstandingBalance`.
            if (typeof data.outstandingBalance === 'number') {
                data.outstandingBalance =
                    Math.round((data.outstandingBalance + fee.cost) * 100) / 100;
            }

            return JSON.stringify(data);
        } catch {
            return raw;
        }
    };

    const respond = (xhr: any, status: number, body: unknown, delayMs = 150) => {
        const text = JSON.stringify(body);
        const define = (name: string, value: unknown) =>
            Object.defineProperty(xhr, name, { configurable: true, get: () => value });

        setTimeout(() => {
            define('readyState', 4);
            define('status', status);
            define('statusText', status === 200 ? 'OK' : status === 201 ? 'Created' : 'Mocked');
            define('responseURL', xhr.__mockUrl);
            define('responseText', text);
            define('response', xhr.responseType === 'json' ? body : text);
            xhr.getResponseHeader = (h: string) =>
                /^content-type$/i.test(h) ? 'application/json' : null;
            xhr.getAllResponseHeaders = () => 'content-type: application/json\r\n';

            ['readystatechange', 'load', 'loadend'].forEach((type) => {
                const evt = new Event(type);
                const handler = xhr[`on${type}`];

                if (typeof handler === 'function') handler.call(xhr, evt);
                xhr.dispatchEvent(evt);
            });
        }, delayMs);
    };

    proto.open = function (this: any, method: string, url: string | URL) {
        this.__mockMethod = String(method).toUpperCase();
        this.__mockUrl = String(url);

        return (origOpen as any).apply(this, arguments);
    };

    proto.send = function (this: any, body?: any) {
        const method: string = this.__mockMethod;
        const url: string = this.__mockUrl;

        const surchargeMatch =
            method === 'POST' &&
            /\/api\/storefront\/checkouts\/([^/?]+)\/surcharge\/?(\?.*)?$/.exec(url);

        if (surchargeMatch) {
            answerSurcharge(this, surchargeMatch[1], body, respond);

            return;
        }

        if (
            method === 'GET' &&
            readFee() &&
            /\/api\/storefront\/checkouts?\/[^/?]+\/?(\?.*)?$/.test(url)
        ) {
            const xhr = this;

            Object.defineProperty(xhr, 'responseText', {
                configurable: true,
                get: () => withFee(origResponseText!.get!.call(xhr)),
            });
            Object.defineProperty(xhr, 'response', {
                configurable: true,
                get: () => {
                    const raw = origResponse!.get!.call(xhr);

                    return typeof raw === 'string'
                        ? withFee(raw)
                        : JSON.parse(withFee(JSON.stringify(raw)));
                },
            });
            note('GET checkout -> real response + mocked fee');
        }

        return (origSend as any).apply(this, arguments);
    };

    (window as any).__surchargeMock = {
        config,
        reset: () => {
            writeFee(null);
            note('fee cleared - reload the page');
        },
    };
}
