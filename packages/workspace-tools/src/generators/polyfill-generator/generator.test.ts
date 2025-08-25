/* eslint-disable import/no-extraneous-dependencies, no-console */
import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import polyfillGenerator from './generator';

describe('polyfillGenerator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();

        tree.write(
            'packages/core/project.json',
            JSON.stringify({
                name: 'core',
                root: 'packages/core',
                sourceRoot: 'packages/core/src',
                projectType: 'library',
            }),
        );

        jest.clearAllMocks();

        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should generate polyfill file with default options', () => {
        polyfillGenerator(tree, { projectName: 'core' });

        const generatedFile = tree.read(
            'packages/core/src/app/generated/polyfill/index.ts',
            'utf-8',
        );

        expect(generatedFile).toBeDefined();
        expect(generatedFile?.includes("import 'core-js/modules/")).toBe(true);
    });

    it('should generate polyfill file with custom output path', () => {
        polyfillGenerator(tree, {
            projectName: 'core',
            browserslistQuery: 'Chrome 61',
            outputPath: 'src/custom/polyfills.ts',
        });

        const generatedFile = tree.read('packages/core/src/custom/polyfills.ts', 'utf-8');

        expect(generatedFile?.includes("import 'core-js/modules/")).toBe(true);
        expect(tree.exists('packages/core/src/app/generated/polyfill/index.ts')).toBe(false);
    });

    it('should handle very modern browser targets with minimal polyfills', () => {
        polyfillGenerator(tree, {
            projectName: 'core',
            browserslistQuery: 'Chrome 120',
        });

        const generatedFile = tree.read(
            'packages/core/src/app/generated/polyfill/index.ts',
            'utf-8',
        );

        expect(generatedFile).toBeDefined();

        const lines = generatedFile?.split('\n') || [];
        const importLines = lines.filter((line) => line.startsWith("import 'core-js/modules/"));

        expect(importLines.length).toEqual(191);
    });

    it('should handle older browser targets requiring more polyfills', () => {
        polyfillGenerator(tree, {
            projectName: 'core',
            browserslistQuery: 'ie 11',
        });

        const generatedFile = tree.read(
            'packages/core/src/app/generated/polyfill/index.ts',
            'utf-8',
        );

        expect(generatedFile).toBeDefined();

        const lines = generatedFile?.split('\n') || [];
        const importLines = lines.filter((line) => line.startsWith("import 'core-js/modules/"));

        expect(importLines.length).toEqual(422);
    });

    it('should log generation statistics', () => {
        polyfillGenerator(tree, { projectName: 'core' });

        expect(console.log).toHaveBeenCalledWith(
            'Generated polyfill file at packages/core/src/app/generated/polyfill/index.ts',
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Browser targets: \d+ browsers/),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Required polyfills: \d+ polyfills/),
        );
    });
});
