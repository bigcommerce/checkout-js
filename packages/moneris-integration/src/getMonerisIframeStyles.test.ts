import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';
import { getCreditCardInputStyles } from '@bigcommerce/checkout/instrument-utils';

import getMonerisIframeStyles from './getMonerisIframeStyles';

jest.mock('@bigcommerce/checkout/instrument-utils', () => ({
    ...jest.requireActual<typeof import('@bigcommerce/checkout/instrument-utils')>(
        '@bigcommerce/checkout/instrument-utils',
    ),
    getCreditCardInputStyles: jest.fn(),
}));

jest.mock('@bigcommerce/checkout/dom-utils', () => ({
    getAppliedStyles: jest.fn(),
}));

describe('getMonerisIframeStyles', () => {
    beforeEach(() => {
        jest.mocked(getCreditCardInputStyles).mockImplementation((containerId: string) => {
            if (containerId.includes('cc-expiry')) {
                return Promise.resolve({ width: '120px' });
            }

            if (containerId.includes('cc-cvv') || containerId.includes('ccCvv')) {
                return Promise.resolve({ width: '80px' });
            }

            return Promise.resolve({
                backgroundColor: 'rgb(255, 255, 255)',
                border: '1px solid rgb(221, 221, 221)',
                borderRadius: '4px',
                color: 'rgb(51, 51, 51)',
                fontFamily: '"Open Sans", sans-serif',
                fontSize: '13px',
                fontWeight: '400',
                height: '45px',
                outline: '0',
                padding: '12px 16px',
            });
        });

        jest.mocked(getAppliedStyles).mockReturnValue({
            color: 'rgb(95, 95, 95)',
            fontFamily: '"Open Sans", sans-serif',
            fontSize: '13px',
            fontWeight: '500',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('maps checkout input styles to Moneris iframe CSS params', async () => {
        document.body.innerHTML = `
            <div id="moneris-cc-number"></div>
            <div id="moneris-cc-expiry"></div>
            <div id="moneris-cc-cvv"></div>
        `;

        const styles = await getMonerisIframeStyles({
            cardNumberContainerId: 'moneris-cc-number',
            cardExpiryContainerId: 'moneris-cc-expiry',
            cardCodeContainerId: 'moneris-cc-cvv',
        });

        expect(styles.cssBody).toContain('font-family: "Open Sans", sans-serif;');
        expect(styles.cssBody).toContain('background: transparent;');
        expect(styles.cssTextbox).toContain('border-radius: 4px;');
        expect(styles.cssTextbox).toContain('width: 100%;');
        expect(styles.cssTextboxCardNumber).toBe('width: 100%;');
        expect(styles.cssTextboxExpiryDate).toBe('width: 120px;');
        expect(styles.cssTextboxCVV).toBe('width: 80px;');
        expect(styles.cssInputLabel).toContain('font-weight: 500;');
    });
});
