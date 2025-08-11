declare global {
    interface Window {
        sentryOnLoad?: () => void;
    }
}

export {};
