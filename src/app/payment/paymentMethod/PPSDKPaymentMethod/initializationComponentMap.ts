import { FunctionComponent } from 'react';

import { NoUI } from './NoUI';

type ComponentMap = Record<string, FunctionComponent>;

export const initializationComponentMap: ComponentMap = {
    NONE: NoUI,
};
