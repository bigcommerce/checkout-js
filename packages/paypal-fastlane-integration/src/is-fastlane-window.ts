import { type FastlaneHostWindow } from './types';

export default function isFastlaneHostWindow(window: Window): window is FastlaneHostWindow {
    /* eslint-disable no-prototype-builtins */
    return window.hasOwnProperty('paypalFastlane') || window.hasOwnProperty('braintreeFastlane');
}
