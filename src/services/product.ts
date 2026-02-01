import { Product as Build } from '@prisma/client';
import { Product as Controller } from '../controllers';
import { ServiceFactory } from '../helpers';
class Service extends ServiceFactory<Build> { }
export default new Service(Controller);
