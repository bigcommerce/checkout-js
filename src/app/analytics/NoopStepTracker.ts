import StepTracker from './StepTracker';

export default class NoopStepTracker implements StepTracker {
    trackCheckoutStarted(): void {
        return;
    }

    trackOrderComplete(): void {
        return;
    }

    trackStepViewed(): void {
        return;
    }

    trackStepCompleted(): void {
        return;
    }
}
