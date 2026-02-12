import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { Order as Build } from '@prisma/client';
import { Order as Service, Code as codeService } from '../services';
import { Order as Schema } from '../schemas';
import '@fastify/jwt';
import { auth } from '../utils';
import { Order as Type } from '../types';

const routes: FastifyPluginCallback = server => {
    server.route({
        method: 'POST',
        url: '/',
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Type.body; }>, reply: FastifyReply) => {
            try {
                const code = await codeService.getById((request.user as { id: number; }).id);
                if (!code) {
                    return reply.status(401).send({ error: 'Invalid authentication token' });
                }
                const result = await Service.createOrder(request.body, code);
                reply.send({
                    success: true,
                    orderId: result.id,
                    message: 'Order created successfully'
                });
            } catch (error: any) {
                const statusCode = error.statusCode || 500;
                const message = error.message || 'Internal server error';
                reply.status(statusCode).send({ error: message });
            }
        }
    });

    server.route({
        method: 'GET',
        url: '/',
        schema: Schema.search,
        preHandler: auth,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const result = await Service.getAll();
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'GET',
        url: '/export/:format',
        preHandler: auth,
        handler: async (
            request: FastifyRequest<{ Params: { format: string; }; Querystring: { [key in keyof Build]?: Build[key] }; }>,
            reply: FastifyReply
        ) => {
            await Service.export(request.params.format, reply, request.query);
        }
    });

    server.route({
        method: 'GET',
        url: '/search',
        schema: Schema.search,
        preHandler: auth,
        handler: async (
            request: FastifyRequest<{ Querystring: { [key in keyof Build]?: Build[key] }; }>,
            reply: FastifyReply
        ) => {
            const result = await Service.search(request.query);
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'GET',
        url: '/find',
        schema: Schema.find,
        preHandler: auth,
        handler: async (
            request: FastifyRequest<{ Querystring: { [key in keyof Build]?: Build[key] }; }>,
            reply: FastifyReply
        ) => {
            const result = await Service.find(request.query);
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'GET',
        url: '/:id',
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: number; }; }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Order not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'PUT',
        url: '/:id',
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: number; }; Body: Partial<Build>; }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            if (!result) {
                return reply.status(404).send({ error: 'Order not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'DELETE',
        url: '/:id',
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: number; }; }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Order not found' });
            }
            reply.send({ data: { message: 'Order deleted successfully' } });
        }
    });
};

export default routes;
