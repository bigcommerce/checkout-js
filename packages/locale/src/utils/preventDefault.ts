import { SyntheticEvent } from 'react';

export default function preventDefault<
    TFunc extends (event: TEvent, ...args: any[]) => any,
    TEvent extends SyntheticEvent,
>(fn?: TFunc): (event: TEvent) => void {
    return (event) => {
        event.preventDefault();

        if (fn) {
            fn(event);
        }
    };
}
