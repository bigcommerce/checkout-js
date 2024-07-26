export interface FastlaneWatermarkComponent {
    FastlaneWatermarkComponent: (
        options?: FastlaneWatermarkOptions,
    ) => Promise<FastlanePrivacySettings>;
}

interface FastlaneWatermarkOptions {
    includeAdditionalInfo: boolean;
}

export interface FastlanePrivacySettings {
    render(container: string): void;
}

interface FastlaneHostWindow extends Window {
    paypalFastlane: FastlaneWatermarkComponent;
    braintreeFastlane: FastlaneWatermarkComponent;
}

export default function isFastlaneHostWindow(window: Window): window is FastlaneHostWindow {
    /* eslint-disable no-prototype-builtins */
    return window.hasOwnProperty('paypalFastlane') || window.hasOwnProperty('braintreeFastlane');
}
