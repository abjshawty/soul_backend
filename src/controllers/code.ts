import { Code as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';

class Controller extends ControllerFactory<Build> {
    async login (code: string): Promise<Build> {
        const existingCode = await this.collection.findFirst({ where: { code } });
        if (!existingCode) {
            const error: any = new Error('Code not found');
            error.statusCode = '404';
            throw error;
        }
        return existingCode;
    }
}

export default new Controller('code');
