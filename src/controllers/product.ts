import { Product as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';

class Controller extends ControllerFactory<Build> { }

export default new Controller('product');
