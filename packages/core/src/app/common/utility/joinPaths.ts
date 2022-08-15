/* eslint-disable import/export */
export default function joinPaths(first: string, second: string, ...paths: string[]): string;

export default function joinPaths(...paths: string[]): string {
    const first = paths.shift() || '';
    const last = paths.pop() || '';

    return [
        first.replace(/\/$/, ''),
        ...paths.map((path) => path.replace(/^\/|\/$/g, '')),
        last.replace(/^\//, ''),
    ]
        .filter((value) => !!value)
        .join('/');
}
