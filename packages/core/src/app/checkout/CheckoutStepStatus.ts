import CheckoutStepType from './CheckoutStepType';

export default interface CheckoutStepStatus {
    isActive: boolean;
    isComplete: boolean;
    isEditable: boolean;
    isRequired: boolean;
    type: CheckoutStepType;
}
