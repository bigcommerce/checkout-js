import { CreditCardInputStylesType, getCreditCardInputStyles } from '.';

describe('getCreditCardInputStyles', () => {
    let container: HTMLElement;
    let style: HTMLStyleElement;

    beforeEach(() => {
        container = document.createElement('div');

        container.id = 'form-field';
        document.body.appendChild(container);

        style = document.createElement('style');

        document.head.appendChild(style);

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const stylesheet = style.sheet as CSSStyleSheet;
        const rules = [
            `.form-input {
                color: rgb(0, 0, 0);
                font-size: 20px;
            }`,
            `.form-field--error .form-input {
                color: rgb(255, 0, 0);
            }`,
            `.form-input--focus {
                color: rgb(0, 0, 255);
            }`,
        ];

        rules.forEach((rule, index) => {
            stylesheet.insertRule(rule, index);
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('returns default styles of credit card input', async () => {
        const styles = await getCreditCardInputStyles('form-field', ['color', 'fontSize']);

        expect(styles).toEqual({
            color: 'rgb(0, 0, 0)',
            fontSize: '20px',
        });
    });

    it('returns error styles of credit card input', async () => {
        const styles = await getCreditCardInputStyles(
            'form-field',
            ['color', 'fontSize'],
            CreditCardInputStylesType.Error,
        );

        expect(styles).toEqual({
            color: 'rgb(255, 0, 0)',
            fontSize: '20px',
        });
    });

    it('returns focus styles of credit card input', async () => {
        const styles = await getCreditCardInputStyles(
            'form-field',
            ['color', 'fontSize'],
            CreditCardInputStylesType.Focus,
        );

        expect(styles).toEqual({
            color: 'rgb(0, 0, 255)',
            fontSize: '20px',
        });
    });
});
