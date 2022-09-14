import { SyntheticEvent } from 'react';

export default function stopPropagation<
    TFunc extends (event: TEvent, ...args: any[]) => any,
    TEvent extends SyntheticEvent,
>(fn?: TFunc): (event: TEvent) => void {
    return (event) => {
        event.stopPropagation();

        if (fn) {
            fn(event);
        }
    };
}
