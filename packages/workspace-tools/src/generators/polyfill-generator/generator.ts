/* eslint-disable no-console, import/no-extraneous-dependencies */
import { readProjectConfiguration, type Tree } from '@nx/devkit';
import browserslist from 'browserslist';
import { compat } from 'core-js-compat';
import { join } from 'path';

export interface PolyfillGeneratorOptions {
    projectName: string;
    browserslistQuery?: string;
    outputPath?: string;
}

export default function polyfillGenerator(tree: Tree, options: PolyfillGeneratorOptions) {
    const {
        projectName,
        browserslistQuery = 'defaults and fully supports es6',
        outputPath = 'src/app/generated/polyfill/index.ts',
    } = options;

    const libraryRoot = readProjectConfiguration(tree, projectName).root;
    const targets = browserslist(browserslistQuery);
    const { list } = compat({ targets });

    const imports =
        list.length > 0
            ? list.map((polyfill: string) => `import 'core-js/modules/${polyfill}';`).join('\n')
            : '// No polyfills needed for the current browser targets';

    const content = `// Generated file - do not edit manually
// Run 'npx nx run core:generate' to regenerate
// Browser targets: ${targets.slice(0, 5).join(', ')}${targets.length > 5 ? ` and ${targets.length - 5} more` : ''}

${imports}
`;

    const outputFilePath = join(libraryRoot, outputPath);

    tree.write(outputFilePath, content);

    console.log(`Generated polyfill file at ${outputFilePath}`);
    console.log(`Browser targets: ${targets.length} browsers`);
    console.log(`Required polyfills: ${list.length} polyfills`);
}
