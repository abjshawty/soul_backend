import { Code as Build } from '@prisma/client';
import { Code as Controller } from '../controllers';
import { ServiceFactory } from '../helpers';
class Service extends ServiceFactory<Build> {
    getByCode (code: string) {
        return Controller.find({ code });
    }
    async login (code: string) {
        const result = await Controller.login(code);
        if (!result) {
            const error: any = new Error('Code not found');
            error.statusCode = '404';
            throw error;
        }
        return result;
    }
}
export default new Service(Controller);
