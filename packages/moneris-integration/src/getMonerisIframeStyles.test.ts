import { getAppliedStyles } from '@bigcommerce/checkout/dom-utils';

import getMonerisIframeStyles from './getMonerisIframeStyles';

jest.mock('@bigcommerce/checkout/dom-utils', () => ({
    getAppliedStyles: jest.fn(),
}));

describe('getMonerisIframeStyles', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="moneris-cc-number"></div>
        `;

        jest.mocked(getAppliedStyles).mockImplementation((element, properties) => {
            if (element.classList.contains('optimizedCheckout-form-label')) {
                return {
                    color: 'rgb(95, 95, 95)',
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: '500',
                };
            }

            return properties.reduce<{ [key: string]: string }>((result, property) => {
                const inputStyles: Record<string, string> = {
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: '1px solid rgb(221, 221, 221)',
                    borderColor: 'rgb(221, 221, 221)',
                    borderRadius: '4px',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    color: 'rgb(51, 51, 51)',
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: '13px',
                    fontWeight: '400',
                    height: '45px',
                    outline: '0',
                };

                if (inputStyles[property]) {
                    result[property] = inputStyles[property];
                }

                return result;
            }, {});
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('maps checkout input styles to Moneris iframe CSS params', () => {
        const styles = getMonerisIframeStyles({
            cardNumberContainerId: 'moneris-cc-number',
        });

        expect(styles.cssBody).toContain('display: grid;');
        expect(styles.cssBody).toContain('grid-template-columns: 1fr 1fr;');
        expect(styles.cssBody).not.toContain('grid-template-areas');
        expect(styles.cssBody).toContain('font-family: "Open Sans", sans-serif;');
        expect(styles.cssBody).toContain('background: transparent;');

        expect(styles.cssTextbox).toContain('justify-self: stretch;');
        expect(styles.cssTextbox).toContain('padding: 0 12px;');
        expect(styles.cssTextbox).toContain('border-radius: 4px;');
        expect(styles.cssTextbox).not.toContain('padding: 12px 16px;');

        expect(styles.cssTextboxCardNumber).toBe('grid-column: 1 / 3; grid-row: 1;');
        expect(styles.cssTextboxExpiryDate).toBe('grid-column: 1; grid-row: 2;');
        expect(styles.cssTextboxCVV).toBe('grid-column: 2; grid-row: 2;');

        expect(styles.cssInputLabel).toContain('font-size: 0.75rem;');
        expect(styles.cssInputLabel).toContain('justify-self: start;');
        expect(styles.cssInputLabel).toContain('font-weight: 500;');
        expect(styles.cssInputLabel).toContain('font-family: Open Sans, sans-serif;');
        expect(styles.cssInputLabel).not.toContain('font-size: 13px;');

        expect(styles.cssLabelCardNumber).toBe('grid-column: 1 / 3; grid-row: 1;');
        expect(styles.cssLabelExpiryDate).toBe('grid-column: 1; grid-row: 2;');
        expect(styles.cssLabelCVV).toBe('grid-column: 2; grid-row: 2;');
    });

    it('returns layout-only styles and logs when style probe elements are missing', () => {
        const onMissingStyleContainer = jest.fn();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        document.body.innerHTML = '';

        const styles = getMonerisIframeStyles({
            cardNumberContainerId: 'moneris-cc-number',
            onMissingStyleContainer,
        });

        expect(styles.cssBody).toContain('display: grid;');
        expect(styles.cssBody).toContain('background: transparent;');
        expect(styles.cssBody).not.toContain('font-family:');

        expect(styles.cssTextbox).toContain('padding: 0 12px;');
        expect(styles.cssTextbox).not.toContain('border-radius:');

        expect(styles.cssInputLabel).toContain('font-size: 0.75rem;');
        expect(styles.cssInputLabel).not.toContain('font-weight:');

        expect(onMissingStyleContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'Unable to retrieve input styles as the provided container ID is not valid.',
            }),
        );
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        getMonerisIframeStyles({
            cardNumberContainerId: 'moneris-cc-number',
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    'Unable to retrieve input styles as the provided container ID is not valid.',
            }),
            { containerId: 'moneris-cc-number' },
        );

        consoleErrorSpy.mockRestore();
    });
});
