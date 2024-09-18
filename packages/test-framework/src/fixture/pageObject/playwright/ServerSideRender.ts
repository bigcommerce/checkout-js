import ejs from 'ejs';

/**
 * @internal
 */
export class ServerSideRender {
    renderFile(filePath: string, data?: Record<string, unknown>): Promise<string> {
        return ejs.renderFile(filePath, data);
    }
}
