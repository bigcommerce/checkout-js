export function getYear(offset: number): string {
    return (new Date().getFullYear() + offset).toString();
}
