import { createContext, type ReactNode } from 'react';

// Lets an ancestor (e.g. the enhancedThemeV1 payment method list) swap the
// default spinner rendered by LoadingOverlay and LazyContainer for a skeleton,
// without threading a prop through every payment integration package.
export const LoadingSkeletonContext = createContext<ReactNode | undefined>(undefined);
