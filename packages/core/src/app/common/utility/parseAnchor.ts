export default function parseAnchor(text: string): string[] {
    const div = document.createElement('div');

    div.innerHTML = text;

    const anchor = div.querySelector('a');

    if (!anchor) {
        return [];
    }

    const anchorSiblings = div.innerHTML.split(anchor.outerHTML);

    return [anchorSiblings[0], anchor.text, anchorSiblings[1]];
}
