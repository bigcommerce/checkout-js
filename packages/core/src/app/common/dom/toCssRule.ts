import { assign, kebabCase, map, pickBy } from 'lodash';

export default function toCSSRule(
    selector: string,
    ...styles: Array<{ [key: string]: any } | undefined>
): string {
    const mergedStyles = assign({}, ...styles);
    const props = map(
        pickBy(mergedStyles, (value) => typeof value === 'string'),
        (value, key) => `${kebabCase(key)}: ${value};`,
    ).join(' ');

    return `${selector} {${props}}`;
}
