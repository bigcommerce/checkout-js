export default function isMobile(): boolean {
    return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}
