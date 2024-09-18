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

export interface FastlaneHostWindow extends Window {
    paypalFastlane: FastlaneWatermarkComponent;
    braintreeFastlane: FastlaneWatermarkComponent;
}
