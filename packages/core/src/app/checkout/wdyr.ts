import React from 'react';

// We want to use `require` here because we only want to import the package
// in development mode.

if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    
    whyDidYouRender(React, {
        trackAllPureComponents: true,
        collapseGroups: true,
    });
}
