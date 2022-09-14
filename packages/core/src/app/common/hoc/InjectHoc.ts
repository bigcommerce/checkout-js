import { ComponentType } from 'react';
import { Omit } from 'utility-types';

export type MatchedProps<TInjectedProps, TProps> = {
    [P in keyof TProps]: P extends keyof TInjectedProps
        ? TInjectedProps[P] extends TProps[P]
            ? TProps[P]
            : never
        : TProps[P];
};

// eslint-disable-next-line @typescript-eslint/ban-types
type InjectHoc<TInjectedProps, TOwnProps = {}> = <
    TProps extends MatchedProps<TInjectedProps, TProps> & TOwnProps,
>(
    OriginalComponent: ComponentType<TProps>,
) => ComponentType<Omit<TProps, keyof TInjectedProps>>;

export default InjectHoc;
