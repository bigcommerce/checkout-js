export function assignLocation(url: string): void {
    window.location.assign(url);
}

export function replaceLocation(url: string): void {
    window.location.replace(url);
}

export function reloadLocation(): void {
    window.location.reload();
}

export function assignTopLocation(url: string): void {
    window.top?.location.assign(url);
}

export function replaceTopLocation(url: string): void {
    window.top?.location.replace(url);
}

export function setTopLocationHref(url: string): void {
    if (window.top) {
        window.top.location.href = url;
    }
}
