import ejs from 'ejs';

/**
 * @internal
 */
export class ServerSideRender {
    async renderFile(filePath: string, data?: Record<string, unknown>): Promise<string> {
        return await ejs.renderFile(filePath, data);
    }
}
