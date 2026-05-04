export default function getNestedValue(obj: any, path: string): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}
