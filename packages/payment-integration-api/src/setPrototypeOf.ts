export default function setPrototypeOf<T extends object>(object: T, prototype: object): T {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    } else if (hasProto(object)) {
        // eslint-disable-next-line no-proto
        object.__proto__ = prototype;
    }

    return object;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function hasProto(object: object): object is object & { __proto__: object } {
    return '__proto__' in object;
}
