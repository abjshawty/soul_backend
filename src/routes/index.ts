import { FastifyInstance } from 'fastify';
import code from './code';
import product from './product';
import order from './order';
export default function (server: FastifyInstance) {
    server.register(product, { prefix: '/product' });
    server.register(code, { prefix: '/code' });
    server.register(order, { prefix: '/order' });
}
