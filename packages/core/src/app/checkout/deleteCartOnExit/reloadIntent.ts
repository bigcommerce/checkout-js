interface BrowserNavigateEvent {
    navigationType?: string;
}

interface BrowserNavigation {
    addEventListener?(type: 'navigate', listener: (event: BrowserNavigateEvent) => void): void;
    removeEventListener?(type: 'navigate', listener: (event: BrowserNavigateEvent) => void): void;
}

interface ReloadWatcher {
    isReloadIntended(): boolean;
    stop(): void;
}

export function watchForReload(): ReloadWatcher {
    let reloadIntended = false;

    const { navigation } = window as unknown as { navigation?: BrowserNavigation };

    const handleNavigate = (event: BrowserNavigateEvent): void => {
        if (event.navigationType === 'reload') {
            reloadIntended = true;
        }
    };

    navigation?.addEventListener?.('navigate', handleNavigate);

    let resetIntentTimer: number | undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
        const isReloadKey =
            event.key === 'F5' ||
            ((event.ctrlKey || event.metaKey) && (event.key === 'r' || event.key === 'R'));

        if (!isReloadKey) {
            return;
        }

        reloadIntended = true;

        window.clearTimeout(resetIntentTimer);

        resetIntentTimer = window.setTimeout(() => {
            reloadIntended = false;
        }, 1000);
    };

    window.addEventListener('keydown', handleKeyDown);

    return {
        isReloadIntended: (): boolean => reloadIntended,
        stop: (): void => {
            navigation?.removeEventListener?.('navigate', handleNavigate);
            window.removeEventListener('keydown', handleKeyDown);
            window.clearTimeout(resetIntentTimer);
        },
    };
}
