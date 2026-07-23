import { createContext, type ReactNode, useContext } from 'react';

export type SetCheckoutStepHeaderAction = (action: ReactNode) => void;

const noop: SetCheckoutStepHeaderAction = () => {};

const CheckoutStepHeaderActionContext = createContext<SetCheckoutStepHeaderAction>(noop);

export default CheckoutStepHeaderActionContext;

export function useSetCheckoutStepHeaderAction(): SetCheckoutStepHeaderAction {
    return useContext(CheckoutStepHeaderActionContext);
}
