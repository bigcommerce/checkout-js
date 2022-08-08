export default function setPrototypeOf<T extends object>(object: T, prototype: object): T {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    } else if (hasProto(object)) {
        object.__proto__ = prototype;
    }

    return object;
}

function hasProto(object: object): object is object & { __proto__: object } {
    return '__proto__' in object;
}
