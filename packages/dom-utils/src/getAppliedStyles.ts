import { kebabCase } from 'lodash';

export default function getAppliedStyles(
    element: HTMLElement,
    properties: string[],
): { [key: string]: string } {
    const declaration = window.getComputedStyle(element);

    return properties.reduce(
        (result, propertyName) => ({
            ...result,
            [propertyName]: declaration.getPropertyValue(kebabCase(propertyName)),
        }),
        {},
    );
}
