// NOTE: For now, need to coerce the type as mutable array / object. Otherwise,
// we'll need to change the props of all components as readonly.
export const EMPTY_ARRAY = Object.freeze([]) as never[];
export const EMPTY_OBJECT = Object.freeze({}) as any;
