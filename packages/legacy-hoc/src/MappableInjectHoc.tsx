import InjectHoc from './InjectHoc';

export type MapToProps<TContextProps, TMappedProps, TOwnProps> = (
    context: TContextProps,
    props: TOwnProps,
) => TMappedProps | null;

export type MapToPropsFactory<TContextProps, TMappedProps, TOwnProps> = () => MapToProps<
    TContextProps,
    TMappedProps,
    TOwnProps
>;

type MappableInjectHoc<TContextProps> = <TMappedProps, TOwnProps>(
    mapToProps:
        | MapToProps<TContextProps, TMappedProps, TOwnProps>
        | MapToPropsFactory<TContextProps, TMappedProps, TOwnProps>,
) => InjectHoc<TMappedProps, TOwnProps>;

export default MappableInjectHoc;
