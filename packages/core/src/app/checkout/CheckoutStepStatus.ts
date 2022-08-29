import CheckoutStepType from './CheckoutStepType';

export default interface CheckoutStepStatus {
    isActive: boolean;
    isBusy: boolean;
    isComplete: boolean;
    isEditable: boolean;
    isRequired: boolean;
    type: CheckoutStepType;
}
