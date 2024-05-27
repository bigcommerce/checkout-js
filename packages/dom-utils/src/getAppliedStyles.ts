import { kebabCase } from 'lodash';

export default function getAppliedStyles(
    element: HTMLElement,
    properties: string[],
    placeholder?: boolean,
): { [key: string]: string } {
    const declaration = window.getComputedStyle(
        element,
        placeholder ? ':placeholder-shown' : undefined,
    );

    return properties.reduce(
        (result, propertyName) => ({
            ...result,
            [propertyName]: declaration.getPropertyValue(kebabCase(propertyName)),
        }),
        {},
    );
}
