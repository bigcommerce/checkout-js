declare global {
    interface Scheduler {
        yield(): Promise<void>;
    }

    interface Window {
        sentryOnLoad?: () => void;
        scheduler?: Scheduler;
    }
}

export {};
