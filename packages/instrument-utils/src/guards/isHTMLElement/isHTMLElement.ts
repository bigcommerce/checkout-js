export default function isHTMLElement(element: unknown): element is HTMLElement {
    return element instanceof HTMLElement;
}
