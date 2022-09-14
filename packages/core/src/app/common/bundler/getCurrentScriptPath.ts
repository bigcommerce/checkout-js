// `document.currentScript` can only be called at the global level as it only
// holds a reference to the script when it is initially processed.
const path = document.currentScript ? (document.currentScript as HTMLScriptElement).src : undefined;

export default function getCurrentScriptPath(): string | undefined {
    return path;
}
