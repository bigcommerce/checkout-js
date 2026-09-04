import { noop } from 'lodash';
import { createContext, type ReactNode, useContext } from 'react';

type SetCheckoutStepHeaderAction = (action: ReactNode) => void;

export const CheckoutStepHeaderActionContext = createContext<SetCheckoutStepHeaderAction>(noop);

export function useSetCheckoutStepHeaderAction(): SetCheckoutStepHeaderAction {
    return useContext(CheckoutStepHeaderActionContext);
}
