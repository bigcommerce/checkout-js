export default interface AutoExportConfig {
    entries: AutoExportConfigEntry[];
    tsConfigPath: string;
}

export interface AutoExportConfigEntry {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
}
