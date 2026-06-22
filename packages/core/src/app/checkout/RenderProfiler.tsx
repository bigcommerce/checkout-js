import React, {
    type ReactElement,
    type ReactNode,
    Profiler,
    type ProfilerOnRenderCallback,
} from 'react';

declare global {
    interface Window {
        __checkoutRenderCounts: Record<string, number>;
        __checkoutRenderTracking: boolean;
        checkoutRenderReport(): void;
        checkoutRenderReset(): void;
        checkoutRenderStop(): void;
    }
}

window.__checkoutRenderCounts = {};
window.__checkoutRenderTracking = true;

window.checkoutRenderReport = () => {
    const sorted = Object.entries(window.__checkoutRenderCounts)
        .sort(([, a], [, b]) => b - a)
        .reduce<Record<string, { renders: number }>>((acc, [k, v]) => {
            acc[k] = { renders: v };

            return acc;
        }, {});

    // eslint-disable-next-line no-console
    console.table(sorted);
};

window.checkoutRenderReset = () => {
    window.__checkoutRenderCounts = {};
    window.__checkoutRenderTracking = true;
    // eslint-disable-next-line no-console
    console.log('[RenderProfiler] Reset. Tracking resumed.');
};

window.checkoutRenderStop = () => {
    window.__checkoutRenderTracking = false;
    // eslint-disable-next-line no-console
    console.log('[RenderProfiler] Stopped. Final results:');
    window.checkoutRenderReport();
};

// eslint-disable-next-line no-console
console.info(
    '[RenderProfiler] Tracking from initial render. Call checkoutRenderStop() when done to see results.',
);

const onRender: ProfilerOnRenderCallback = (id) => {
    if (!window.__checkoutRenderTracking) return;
    window.__checkoutRenderCounts[id] = (window.__checkoutRenderCounts[id] ?? 0) + 1;
};

interface RenderProfilerProps {
    id: string;
    children: ReactNode;
}

/**
 * Wraps children with React's <Profiler> to count renders per component.
 *
 * Tracking starts automatically from the initial render.
 *
 * Usage:
 *   1. Load checkout — tracking starts immediately including initial render.
 *   2. Interact with the checkout (type in a field, expand a step, etc.).
 *   3. Call checkoutRenderStop() to freeze counts and print the table.
 *
 * Other helpers:
 *   - checkoutRenderReport() — print current counts without stopping
 *   - checkoutRenderReset()  — clear counts and resume tracking
 */
const RenderProfiler = ({ id, children }: RenderProfilerProps): ReactElement => {
    return (
        <Profiler id={id} onRender={onRender}>
            {children}
        </Profiler>
    );
};

export default RenderProfiler;
