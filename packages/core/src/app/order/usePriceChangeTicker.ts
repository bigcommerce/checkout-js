import { useLayoutEffect, useRef, useState } from 'react';

import { prefersReducedMotion } from '@bigcommerce/checkout/ui';

export type PriceTickerPhase = 'idle' | 'exiting' | 'dots' | 'entering';

export interface PriceChangeTicker {
    phase: PriceTickerPhase;
    displayAmount: number | null | undefined;
}

// Must match the $animation-priceTicker-* / $animation-loadingDots-* settings
// in scss/settings/checkout/animation/_settings.scss.
const SLIDE_DURATION = 200;
const DOT_PULSE_DURATION = 900;
const DOT_STAGGER = 150;

// One full pulse cycle for all three staggered dots.
const DOTS_DURATION = DOT_PULSE_DURATION + DOT_STAGGER * 2;

export const usePriceChangeTicker = (
    amount: number | null | undefined,
    isEnabled = true,
): PriceChangeTicker => {
    const [phase, setPhase] = useState<PriceTickerPhase>('idle');
    const previousAmount = useRef(amount);
    const exitingAmount = useRef(amount);

    useLayoutEffect(() => {
        const oldAmount = previousAmount.current;
        const hasAmountChanged = amount !== oldAmount;

        previousAmount.current = amount;

        if (isEnabled && hasAmountChanged && oldAmount != null && !prefersReducedMotion()) {
            exitingAmount.current = oldAmount;
            setPhase('exiting');

            const timers = [
                setTimeout(() => setPhase('dots'), SLIDE_DURATION),
                setTimeout(() => setPhase('entering'), SLIDE_DURATION + DOTS_DURATION),
                setTimeout(() => setPhase('idle'), SLIDE_DURATION + DOTS_DURATION + SLIDE_DURATION),
            ];

            return () => timers.forEach((timer) => clearTimeout(timer));
        }

        // A non-animating change must still reset a phase left over from a
        // cancelled in-flight animation, or the ticker wedges showing dots.
        setPhase('idle');
    }, [amount, isEnabled]);

    return {
        phase,
        displayAmount: phase === 'exiting' ? exitingAmount.current : amount,
    };
};
