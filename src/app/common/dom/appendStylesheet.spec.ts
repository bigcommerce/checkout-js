import appendStylesheet from './appendStylesheet';

describe('appendStylesheet', () => {
    it('appends CSS rules to document', () => {
        const style = appendStylesheet([
            'body { background-color: rgb(20, 20, 20); }',
            'p { font-size: 20px; }',
        ]);

        expect(style.parentElement)
            .toEqual(document.head);

        expect((style.sheet as CSSStyleSheet).cssRules[0].cssText)
            .toEqual('body {background-color: rgb(20, 20, 20);}');

        expect((style.sheet as CSSStyleSheet).cssRules[1].cssText)
            .toEqual('p {font-size: 20px;}');
    });
});
