// copied from core package
export function isEmbedded(pathname: string = document.location.pathname): boolean {
    const basePath = `/${pathname.split('/')[1]}`;

    return basePath === '/embedded-checkout';
}
