import InjectHoc from './InjectHoc';

type MappableInjectHoc<TContextProps> = <TMappedProps, TOwnProps>(
    mapToProps: (context: NonNullable<TContextProps>, props: TOwnProps) => TMappedProps | null
) => InjectHoc<TMappedProps, TOwnProps>;

export default MappableInjectHoc;
