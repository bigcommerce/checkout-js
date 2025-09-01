/* eslint-disable import/no-named-as-default-member, import/no-extraneous-dependencies */
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import ts from 'typescript';
import { promisify } from 'util';

export interface AutoExportOptions {
    inputPath: string;
    ignorePackages?: string[];
    outputPath: string;
    memberPattern: string;
    tsConfigPath: string;
}

export default async function autoExport({
    inputPath,
    ignorePackages,
    memberPattern,
    tsConfigPath,
}: AutoExportOptions): Promise<string> {
    let filePaths = await promisify(glob)(inputPath);

    if (ignorePackages) {
        filePaths = filePaths.filter((filePath) => {
            const packageName = filePath.split('/')[1];

            return !ignorePackages.includes(packageName);
        });
    }

    const lazyExports = await createLazyLoadingExports(filePaths, tsConfigPath, memberPattern);
    const componentRegistry = await createComponentRegistry(filePaths, memberPattern);

    validateComponentNames(lazyExports, componentRegistry);

    return `${generateLazyLoadingCode(lazyExports)}

${generateComponentRegistryCode(componentRegistry)}
    `;
}

function validateComponentNames(
    lazyExports: Array<{ memberName: string; importPath: string }>,
    componentRegistry: Record<string, unknown>,
): void {
    const lazyExportNames = lazyExports.map(({ memberName }) => memberName);
    const componentRegistryNames = Object.keys(componentRegistry);

    const onlyInRegistry = Array.from(componentRegistryNames).filter(
        (name) => !lazyExportNames.includes(name),
    );

    if (onlyInRegistry.length > 0) {
        throw new Error(`Component name mismatch detected: ${onlyInRegistry.join(', ')}\n`);
    }
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(path.parse(filePath).name, source, ts.ScriptTarget.Latest);
}

function getImportPath(packagePath: string, tsConfigPath: string): string {
    const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    for (const [packageName, paths] of Object.entries(tsConfig.config?.compilerOptions.paths)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if ((paths as string[]).includes(packagePath)) {
            return packageName;
        }
    }

    throw new Error('Unable to resolve to a valid package.');
}

async function createLazyLoadingExports(
    filePaths: string[],
    tsConfigPath: string,
    memberPattern: string,
): Promise<Array<{ memberName: string; importPath: string }>> {
    const memberMappings: Array<{ memberName: string; importPath: string }> = [];

    for (const filePath of filePaths) {
        // eslint-disable-next-line no-await-in-loop
        const root = await getSource(filePath);
        const memberNames = root.statements
            .filter(ts.isExportDeclaration)
            .flatMap((statement) => {
                if (
                    !statement.exportClause ||
                    !ts.isNamedExports(statement.exportClause) ||
                    !statement.exportClause.elements.length
                ) {
                    return [];
                }

                return statement.exportClause.elements.filter(ts.isExportSpecifier);
            })
            .map((element) =>
                'escapedText' in element.name
                    ? element.name.escapedText.toString()
                    : JSON.stringify(element.name),
            )
            .filter((memberName: string) => new RegExp(memberPattern).exec(memberName));

        if (memberNames.length > 0) {
            const importPath = getImportPath(filePath, tsConfigPath);

            memberNames.forEach((memberName) => {
                memberMappings.push({ memberName, importPath });
            });
        }
    }

    return memberMappings;
}

function generateLazyLoadingCode(
    memberMappings: Array<{ memberName: string; importPath: string }>,
): string {
    if (memberMappings.length === 0) {
        return '';
    }

    const importStatements = memberMappings
        .map(
            ({ memberName, importPath }) =>
                `const ${memberName} = lazy(() => import(/* webpackChunkName: "${toKebabCase(memberName)}" */'${importPath}').then(module => ({ default: module.${memberName} })));`,
        )
        .join('\n');

    const exportStatements = memberMappings.map(({ memberName }) => `  ${memberName},`).join('\n');

    return `import { lazy } from 'react';

${importStatements}

export {
${exportStatements}
};`;
}

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

async function createComponentRegistry(
    filePaths: string[],
    memberPattern: string,
): Promise<Record<string, unknown[]>> {
    const componentRegistry: Record<string, unknown[]> = {};

    const packageDirs = filePaths.map((filePath) => {
        const pathParts = filePath.split('/');
        const packageIndex = pathParts.findIndex((part) => part === 'packages');

        return pathParts.slice(0, packageIndex + 2).join('/');
    });

    const uniquePackageDirs = [...new Set(packageDirs)];

    const allPackageFiles = await Promise.all(
        uniquePackageDirs.map(async (packageDir) => {
            return promisify(glob)(`${packageDir}/src/**/*.{ts,tsx}`);
        }),
    );

    const allFiles = allPackageFiles.flat();

    await Promise.all(
        allFiles.map(async (filePath) => {
            const root = await getSource(filePath);
            const toResolvableComponentCalls = findToResolvableComponentCalls(root);

            for (const call of toResolvableComponentCalls) {
                const { componentName, resolveIds } = call;

                if (
                    componentName &&
                    new RegExp(memberPattern).test(componentName) &&
                    resolveIds.length > 0
                ) {
                    componentRegistry[componentName] = resolveIds;
                }
            }
        }),
    );

    return componentRegistry;
}

function findToResolvableComponentCalls(
    sourceFile: ts.SourceFile,
): Array<{ componentName: string; resolveIds: unknown[] }> {
    const results: Array<{ componentName: string; resolveIds: unknown[] }> = [];

    function visit(node: ts.Node) {
        if (
            ts.isExportAssignment(node) &&
            ts.isCallExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'toResolvableComponent'
        ) {
            const callExpression = node.expression;

            if (callExpression.arguments.length >= 2) {
                // First argument should be the component identifier
                const componentArg = callExpression.arguments[0];
                let componentName = '';

                if (ts.isIdentifier(componentArg)) {
                    componentName = componentArg.text;
                }

                // Second argument should be the resolve IDs array
                const resolveIdsArg = callExpression.arguments[1];
                let resolveIds: unknown[] = [];

                if (ts.isArrayLiteralExpression(resolveIdsArg)) {
                    resolveIds = parseResolveIdsArray(resolveIdsArg);
                }

                if (componentName) {
                    results.push({ componentName, resolveIds });
                }
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return results;
}

function parseResolveIdsArray(arrayLiteral: ts.ArrayLiteralExpression): unknown[] {
    return arrayLiteral.elements.map((element) => {
        if (ts.isObjectLiteralExpression(element)) {
            const obj: Record<string, unknown> = {};

            element.properties.forEach((prop) => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    let value: unknown;

                    if (ts.isStringLiteral(prop.initializer)) {
                        value = prop.initializer.text;
                    } else if (ts.isNumericLiteral(prop.initializer)) {
                        value = Number(prop.initializer.text);
                    } else if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                        value = true;
                    } else if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                        value = false;
                    } else if (ts.isPropertyAccessExpression(prop.initializer)) {
                        // Handle enum cases
                        const objectName = ts.isIdentifier(prop.initializer.expression)
                            ? prop.initializer.expression.text
                            : '';
                        const propertyName = prop.initializer.name.text;

                        value = `${objectName}.${propertyName}`;
                    }

                    if (value !== undefined) {
                        obj[prop.name.text] = value;
                    }
                }
            });

            return obj;
        }

        return {};
    });
}

function generateComponentRegistryCode(componentRegistry: Record<string, unknown[]>): string {
    if (Object.keys(componentRegistry).length === 0) {
        return '';
    }

    const entries = Object.entries(componentRegistry)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([componentName, resolveIds]) => {
            const resolveIdsStr = generateResolveIdsString(resolveIds);

            return `  '${componentName}': ${resolveIdsStr}`;
        })
        .join(',\n');

    const enumReferences = new Set<string>();

    Object.values(componentRegistry)
        .flat()
        .forEach((resolveId) => {
            if (typeof resolveId === 'object' && resolveId !== null) {
                Object.values(resolveId).forEach((value) => {
                    if (typeof value === 'string' && value.includes('.')) {
                        const [enumName] = value.split('.');

                        enumReferences.add(enumName);
                    }
                });
            }
        });

    const importStatements = Array.from(enumReferences)
        .map((enumName) => {
            if (enumName === 'PaymentMethodId') {
                return `import { ${enumName} } from '@bigcommerce/checkout/payment-integration-api';`;
            }

            return '';
        })
        .join('\n');

    const importSection = importStatements ? `${importStatements}\n\n` : '';

    return `${importSection}export const ComponentRegistry = {
${entries}
} as const;
`;
}

function generateResolveIdsString(resolveIds: unknown[]): string {
    const formattedResolveIds = resolveIds.map((resolveId) => {
        if (typeof resolveId === 'object' && resolveId !== null) {
            const properties = Object.entries(resolveId).map(([key, value]) => {
                if (typeof value === 'string' && value.includes('.')) {
                    return `"${key}": ${value}`;
                }

                return `"${key}": ${JSON.stringify(value)}`;
            });

            return `    { ${properties.join(', ')} }`;
        }

        return `    ${JSON.stringify(resolveId)}`;
    });

    return `[\n${formattedResolveIds.join(',\n')}\n  ]`;
}
