import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import glob from 'glob';
import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
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
    outputPath,
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

    const exportDeclarations = await Promise.all(
        filePaths.map((filePath) => createExportDeclaration(filePath, tsConfigPath, memberPattern)),
    );

    return ts
        .createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.createNodeArray(exportDeclarations.filter(exists)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext),
        );
}

async function createExportDeclaration(
    filePath: string,
    tsConfigPath: string,
    memberPattern: string,
): Promise<ts.ExportDeclaration | undefined> {
    const root = await getSource(filePath);

    const memberNames = root.statements
        .filter(ts.isExportDeclaration)
        .flatMap((statement) => {
            if (
                !statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                !statement.exportClause.elements
            ) {
                return [];
            }

            return statement.exportClause.elements.filter(ts.isExportSpecifier);
        })
        .map((element) => element.name.escapedText.toString())
        .filter((memberName) => memberName.match(new RegExp(memberPattern)));

    if (memberNames.length === 0) {
        return;
    }

    return ts.factory.createExportDeclaration(
        undefined,
        undefined,
        false,
        ts.factory.createNamedExports(
            memberNames.map((memberName) =>
                ts.factory.createExportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(memberName),
                ),
            ),
        ),
        ts.factory.createStringLiteral(getImportPath(filePath, tsConfigPath), true),
    );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(path.parse(filePath).name, source, ts.ScriptTarget.Latest);
}

function getImportPath(packagePath: string, tsConfigPath: string): string {
    const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    for (const [packageName, paths] of Object.entries(tsConfig.config?.compilerOptions.paths)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        if ((paths as string[]).includes(packagePath)) {
            return packageName;
        }
    }

    throw new Error('Unable to resolve to a valid package.');
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}
