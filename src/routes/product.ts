import { FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import { Product as Build } from '@prisma/client';
import { Product as Service } from '../services';
import { Product as Schema } from '../schemas';
import { auth } from '../utils';

const routes: FastifyPluginCallback = server => {
    server.route({
        method: 'POST',
        url: '/',
        schema: Schema.create,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Body: Build; }>, reply: FastifyReply) => {
            const result = await Service.create(request.body);
            reply.send({ data: result });
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
            const result = await Service.search(request.query, { include: { ExampleAttach: true } });
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
        handler: async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
            const result = await Service.getById(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Admin not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'PUT',
        url: '/:id',
        schema: Schema.update,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string; }; Body: Partial<Build>; }>, reply: FastifyReply) => {
            const result = await Service.update(request.params.id, request.body);
            if (!result) {
                return reply.status(404).send({ error: 'Admin not found' });
            }
            reply.send({ data: result });
        }
    });

    server.route({
        method: 'DELETE',
        url: '/:id',
        schema: Schema.getOrDelete,
        preHandler: auth,
        handler: async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
            const result = await Service.delete(request.params.id);
            if (!result) {
                return reply.status(404).send({ error: 'Admin not found' });
            }
            reply.send({ data: { message: 'Admin deleted successfully' } });
        }
    });
};

export default routes;
