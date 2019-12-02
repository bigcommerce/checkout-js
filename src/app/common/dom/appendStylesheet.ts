export default function appendStylesheet(rules: string[]): HTMLStyleElement {
    const style = document.createElement('style');

    document.head.appendChild(style);

    if (style.sheet instanceof CSSStyleSheet) {
        const { sheet } = style;

        rules.forEach((rule, index) => {
            sheet.insertRule(rule, index);
        });
    }

    return style;
}
