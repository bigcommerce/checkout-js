import fs from 'fs';

import autoExport from './auto-export';

describe('autoExport()', () => {
    it('export matching members from files to another file', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Strategy',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching member is found', async () => {
        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/**/index.ts',
            outputPath: 'packages/workspace-tools/src/generators/auto-export/__temp__/output.ts',
            memberPattern: '^Test',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('creates a component registry from toResolvableComponent calls', async () => {
        const tempPath = 'packages/workspace-tools/src/generators/auto-export/__temp__/';
        const registryPath = `${tempPath}component-registry.ts`;

        const options = {
            inputPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/component-**/index.ts',
            outputPath: `${tempPath}output.ts`,
            memberPattern: '^Component',
            tsConfigPath:
                'packages/workspace-tools/src/generators/auto-export/__fixtures__/tsconfig.json',
            componentRegistryOutputPath: registryPath,
        };

        await autoExport(options);

        // Check if the registry file was created and has expected content
        expect(fs.existsSync(registryPath)).toBe(true);

        const registryContent = fs.readFileSync(registryPath, 'utf8');

        expect(registryContent).toContain('ComponentA');
        expect(registryContent).toContain('ComponentB');
        expect(registryContent).toContain('test-gateway-a');
        expect(registryContent).toContain('test-gateway-b');
        expect(registryContent).toMatchSnapshot();
    });

    it('creates a component registry from real payment integration packages', async () => {
        const tempPath = 'packages/workspace-tools/src/generators/auto-export/__temp__/';
        const registryPath = `${tempPath}real-component-registry.ts`;

        const options = {
            inputPath: 'packages/adyen-integration/src/adyenv2/AdyenV2PaymentMethod.tsx',
            outputPath: `${tempPath}output.ts`,
            memberPattern: '.*',
            tsConfigPath: 'packages/payment-integration-api/tsconfig.json',
            componentRegistryOutputPath: registryPath,
        };

        await autoExport(options);

        // Check if the registry file was created and has expected content
        expect(fs.existsSync(registryPath)).toBe(true);

        const registryContent = fs.readFileSync(registryPath, 'utf8');

        expect(registryContent).toContain('AdyenV2PaymentMethod');
        expect(registryContent).toContain('adyenv2');
        expect(registryContent).toContain('gateway');
    });
});
