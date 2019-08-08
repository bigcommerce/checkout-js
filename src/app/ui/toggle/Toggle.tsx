import { Component, ReactNode } from 'react';

export interface ToggleProps {
    openByDefault?: boolean;
    children(props: any): ReactNode;
}

export interface ToggleState {
    isOpen: boolean;
}

export default class Toggle extends Component<ToggleProps, ToggleState> {
    constructor(props: ToggleProps) {
        super(props);

        this.state = { isOpen: !!props.openByDefault };
    }

    render(): ReactNode {
        const {
            children,
        } = this.props;

        return children({
            ...this.state,
            toggle: this.toggle,
        });
    }

    private toggle: () => void = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };
}
