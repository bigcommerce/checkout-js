import CheckoutStepType from './CheckoutStepType';

export default interface CheckoutStepStatus {
    activeStepType?: CheckoutStepType;
    isActive: boolean;
    isBusy: boolean;
    isComplete: boolean;
    isEditable: boolean;
    isRequired: boolean;
    type: CheckoutStepType;
}
