import { kebabCase } from 'lodash';

export default function getAppliedStyles(
    element: HTMLElement,
    properties: string[],
    pseudoElementSelector?: string,
): { [key: string]: string } {
    const declaration = window.getComputedStyle(element, pseudoElementSelector);

    return properties.reduce(
        (result, propertyName) => ({
            ...result,
            [propertyName]: declaration.getPropertyValue(kebabCase(propertyName)),
        }),
        {},
    );
}
