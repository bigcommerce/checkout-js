import StepTracker from './StepTracker';

export default class NoopStepTracker implements StepTracker {
    trackCheckoutStarted(): void {
        return;
    }

    trackOrderComplete(): void {
        return;
    }

    trackStepViewed(step: string): void {
        return;
    }

    trackStepCompleted(step: string): void {
        return;
    }
}
