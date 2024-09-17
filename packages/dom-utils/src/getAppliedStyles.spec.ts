import getAppliedStyles from './getAppliedStyles';

describe('getAppliedStyles', () => {
    let element: HTMLElement;
    let style: HTMLStyleElement;

    beforeEach(() => {
        element = document.createElement('div');

        element.classList.add('foobar');
        document.body.appendChild(element);

        style = document.createElement('style');

        document.head.appendChild(style);

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const stylesheet = style.sheet as CSSStyleSheet;
        const rules = [
            `.foobar {
                background-color: rgb(255, 0, 0);
                color: inherit;
                display: inline-block;
                font-size: 20px;
            }`,
            `div {
                color: rgb(0, 0, 255);
            }`,
        ];

        rules.forEach((rule, index) => {
            stylesheet.insertRule(rule, index);
        });
    });

    afterEach(() => {
        document.body.removeChild(element);
        document.head.removeChild(style);
    });

    it('returns selected properties as map object', () => {
        expect(getAppliedStyles(element, ['backgroundColor', 'fontSize'])).toEqual({
            backgroundColor: 'rgb(255, 0, 0)',
            fontSize: '20px',
        });
    });

    it('returns inherited styles', () => {
        expect(getAppliedStyles(element, ['color'])).toEqual({
            color: 'rgb(0, 0, 255)',
        });
    });
});
