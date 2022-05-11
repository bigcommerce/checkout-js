import ejs from 'ejs';

export default class ServerSideRender {
    /**
     * @internal
     */
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = 'http://localhost:' + process.env.PORT;
    }

    async renderFile({filePath, data}: {filePath: string; data?: {}}): Promise<string> {
        return await ejs.renderFile(filePath, { ...data, baseUrl: this.baseUrl});
    }
}
