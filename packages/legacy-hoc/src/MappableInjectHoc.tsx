export type MapToProps<TContextProps, TMappedProps, TOwnProps> = (
    context: TContextProps,
    props: TOwnProps,
) => TMappedProps | null;

export type MapToPropsFactory<TContextProps, TMappedProps, TOwnProps> = () => MapToProps<
    TContextProps,
    TMappedProps,
    TOwnProps
>;
